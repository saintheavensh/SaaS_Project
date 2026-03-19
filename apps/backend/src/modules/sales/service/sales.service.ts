import { SalesRepository } from '../repository/sales.repository.js';
import { CreateSaleInput } from '../schemas/sales.schemas.js';
import { SaleStatus } from '../types/sales.types.js';
import { InventoryService } from '../../inventory/service.js';
import { db } from '../../../core/db.js';
import { decimalToMinorUnit, minorUnitToDecimal, safeSubtract } from '../../../core/utils/currency.js';
import { ValidationError } from '../../../core/errors/validation.error.js';
import { Database } from '../../../core/database/tenant-repository-base.js';

import { StockLedgerRepository } from '../../ledger/repository/stock-ledger.repository.js';
import { DiscountService } from '../../marketing/service/discount.service.js';

/**
 * Service for Sales operations.
 * Handles transactional workflow for creating sales and later inventory deduction.
 */
export class SalesService {
    constructor(
        private readonly tenantId: string,
        private readonly repository: SalesRepository,
        private readonly inventoryService: InventoryService,
        private readonly stockLedgerRepo: StockLedgerRepository,
        private readonly discountService: DiscountService
    ) { }

    /**
     * Creates a sale transaction
     */
    async createSale(input: CreateSaleInput): Promise<string> {
        this.validateSaleInput(input);

        let finalSaleId: string = '';

        try {
            await db.transaction(async (tx: Database) => {
                // Step 1: Compute totalRevenue and Discount in minor units
                let totalOriginalCents = 0;
                let totalDiscountCents = 0;
                
                const itemsWithAudit = [];

                for (const item of input.items) {
                    const originalPriceCents = decimalToMinorUnit(item.sellPrice); // Price before override/discount
                    const quantity = item.quantity;
                    
                    // a) Calculate automated discount
                    const { discountAmountCents } = await this.discountService.calculateDiscount(
                        item.sellPrice.toString(),
                        quantity,
                        input.customerId
                    );

                    const lineItemTotalCents = (originalPriceCents * quantity) - discountAmountCents;
                    const finalUnitPriceCents = Math.floor(lineItemTotalCents / quantity);

                    totalOriginalCents += originalPriceCents * quantity;
                    totalDiscountCents += discountAmountCents;

                    itemsWithAudit.push({
                        ...item,
                        originalPrice: item.sellPrice,
                        finalPrice: minorUnitToDecimal(finalUnitPriceCents),
                        discountAmount: minorUnitToDecimal(discountAmountCents),
                    });
                }

                const totalFinalCents = totalOriginalCents - totalDiscountCents;

                // Step 2: Create main sale record with audit fields
                const newSale = await this.repository.createSale({
                    customerId: input.customerId ?? null,
                    totalAmount: minorUnitToDecimal(totalFinalCents),
                    originalAmount: minorUnitToDecimal(totalOriginalCents),
                    discountAmount: minorUnitToDecimal(totalDiscountCents),
                    revenue: minorUnitToDecimal(totalFinalCents), 
                    cogs: '0', // Placeholder, updated later by StockLedger integration
                    grossProfit: '0', // Placeholder, updated later
                    status: 'COMPLETED' as SaleStatus,
                }, tx);

                finalSaleId = newSale.id;

                // Step 3: Perform actual deduction and batch tracking
                for (const item of itemsWithAudit) {
                    // a) Create sale item record FIRST (to get saleItemId)
                    const newSaleItem = await this.repository.createSaleItem({
                        saleId: newSale.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        sellPrice: item.finalPrice,
                        originalPrice: item.originalPrice.toString(),
                        discountAmount: item.discountAmount,
                    }, tx);

                    // b) Actual stock deduction (returns consumed batches)
                    const consumedBatches = await this.inventoryService.handleStockOut({
                        productId: item.productId,
                        quantity: item.quantity,
                        reference: newSale.id, // Linking back to sale
                    }, tx);

                    // c) Record batch-level traceability
                    for (const batch of consumedBatches) {
                        await this.repository.createSaleItemBatch({
                            saleItemId: newSaleItem.id,
                            batchId: batch.batchId,
                            quantity: batch.quantity,
                            sellPrice: item.finalPrice, // Unit price for this line item
                            buyPrice: batch.buyPrice,   // Cost price from batch
                        }, tx);
                    }
                }

                // Step 4: Calculate total COGS and update sale
                const totalCogs = await this.stockLedgerRepo.getCOGSByReference(newSale.id, tx); // Returns string
                const grossProfit = safeSubtract(newSale.revenue, totalCogs);

                await this.repository.updateSaleFinancials(newSale.id, {
                    cogs: totalCogs,
                    grossProfit: grossProfit,
                }, tx);
            });
        } catch (error) {
            console.error('Sale creation failed, transaction rolled back.', error);
            throw error;
        }

        return finalSaleId;
    }

    /**
     * validateSaleInput
     * Standardized validation for sale input.
     */
    private validateSaleInput(input: CreateSaleInput) {
        if (!input.items || input.items.length === 0) {
            throw new ValidationError('Sale must contain at least one item');
        }

        for (const item of input.items) {
            if (item.quantity <= 0) {
                throw new ValidationError(`Invalid quantity for product ${item.productId}`);
            }
        }
    }
}
