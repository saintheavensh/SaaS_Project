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
            await db.transaction(async (tx) => {
                // Step 3: Compute totalRevenue and gather dry-run FIFO data
                let totalRevenueCents = 0;
                let totalCogsCents = 0;
                const itemBatchPreviews: {
                    item: typeof input.items[0],
                    batches: Awaited<ReturnType<InventoryService['deductStockFIFO']>>
                }[] = [];

                for (const item of input.items) {
                    const itemSellPriceCents = decimalToMinorUnit(item.sellPrice);
                    totalRevenueCents += itemSellPriceCents * item.quantity;

                    // Get FIFO preview (dry-run)
                    const batches = await this.inventoryService.deductStockFIFO(
                        item.productId,
                        item.quantity,
                        'DRY_RUN',
                        tx,
                        { dryRun: true }
                    );

                    let itemCogsCents = 0;
                    for (const batch of batches) {
                        const batchBuyPriceCents = decimalToMinorUnit(batch.buyPrice);
                        itemCogsCents += batch.quantity * batchBuyPriceCents;
                    }
                    totalCogsCents += itemCogsCents;
                    itemBatchPreviews.push({ item, batches });
                }

                const grossProfitCents = totalRevenueCents - totalCogsCents;

                // Step 4: Create sale record with financials
                const newSale = await this.repository.createSale({
                    customerId: input.customerId ?? null,
                    totalAmount: minorUnitToDecimal(totalRevenueCents),
                    revenue: minorUnitToDecimal(totalRevenueCents),
                    cogs: minorUnitToDecimal(totalCogsCents),
                    grossProfit: minorUnitToDecimal(grossProfitCents),
                    status: 'COMPLETED' as SaleStatus,
                }, tx);

                finalSaleId = newSale.id;

                // Step 5: Perform actual deduction and create items/batches
                for (const preview of itemBatchPreviews) {
                    // a) Actual FIFO deduction
                    const batches = await this.inventoryService.deductStockFIFO(
                        preview.item.productId,
                        preview.item.quantity,
                        newSale.id,
                        tx
                    );

                    // b) Create sale item record
                    const saleItem = await this.repository.createSaleItem({
                        saleId: newSale.id,
                        productId: preview.item.productId,
                        quantity: preview.item.quantity,
                        sellPrice: preview.item.sellPrice.toString(),
                    }, tx);

                    // c) Record each consumed batch
                    for (const batch of batches) {
                        await this.repository.createSaleItemBatch({
                            saleItemId: saleItem.id,
                            batchId: batch.batchId,
                            quantity: batch.quantity,
                            sellPrice: preview.item.sellPrice.toString(),
                            buyPrice: batch.buyPrice,
                        }, tx);
                    }
                }
            });
        } catch (error) {
            console.error('Gross Profit Engine: Sale creation failed, transaction rolled back.', error);
            throw error;
        }

        return finalSaleId;
    }
}
