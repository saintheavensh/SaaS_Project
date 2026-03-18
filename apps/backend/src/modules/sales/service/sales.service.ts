import { SalesRepository } from '../repository/sales.repository.js';
import { CreateSaleInput } from '../schemas/sales.schemas.js';
import { SaleStatus } from '../types/sales.types.js';
import { InventoryService } from '../../inventory/service.js';
import { db } from '../../../core/db.js';
import { decimalToMinorUnit, minorUnitToDecimal } from '../../../core/utils/currency.js';

/**
 * Service for Sales operations.
 * Handles transactional workflow for creating sales and later inventory deduction.
 */
export class SalesService {
    constructor(
        private readonly tenantId: string,
        private readonly repository: SalesRepository,
        private readonly inventoryService: InventoryService
    ) { }

    /**
     * Creates a sale transaction
     */
    async createSale(input: CreateSaleInput): Promise<string> {
        let finalSaleId: string = '';

        try {
            await db.transaction(async (tx: any) => {
                // Step 1: Compute totalRevenue (COGS calculation deferred/simplified for Step 3)
                let totalRevenueCents = 0;
                
                for (const item of input.items) {
                    const itemSellPriceCents = decimalToMinorUnit(item.sellPrice);
                    totalRevenueCents += itemSellPriceCents * item.quantity;
                }

                // Step 2: Create sale record
                const newSale = await this.repository.createSale({
                    customerId: input.customerId ?? null,
                    totalAmount: minorUnitToDecimal(totalRevenueCents),
                    revenue: minorUnitToDecimal(totalRevenueCents),
                    cogs: '0', // Placeholder as per Step 3 limitations (no FIFO/COGS logic)
                    grossProfit: minorUnitToDecimal(totalRevenueCents), // Placeholder
                    status: 'COMPLETED' as SaleStatus,
                }, tx);

                finalSaleId = newSale.id;

                // Step 3: Perform actual deduction
                for (const item of input.items) {
                    // Actual stock deduction (Step 3: Single batch alignment)
                    const result = await this.inventoryService.handleStockOut({
                        productId: item.productId,
                        quantity: item.quantity,
                        reference: newSale.id, // Linking back to sale
                    }, tx);

                    // Create sale item record
                    const saleItem = await this.repository.createSaleItem({
                        saleId: newSale.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        sellPrice: item.sellPrice.toString(),
                    }, tx);

                    // Record the consumed batch
                    await this.repository.createSaleItemBatch({
                        saleItemId: saleItem.id,
                        batchId: result.batchId,
                        quantity: item.quantity,
                        sellPrice: item.sellPrice.toString(),
                        buyPrice: '0', // Placeholder
                    }, tx);
                }
            });
        } catch (error) {
            console.error('Sale creation failed, transaction rolled back.', error);
            throw error;
        }

        return finalSaleId;
    }
}
