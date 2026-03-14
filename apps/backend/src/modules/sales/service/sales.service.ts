import { SalesRepository } from '../repository/sales.repository.js';
import { CreateSaleInput } from '../schemas/sales.schemas.js';
import { SaleStatus } from '../types/sales.types.js';
import { InventoryService } from '../../inventory/service.js';
import { db } from '../../../core/db.js';

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

        await db.transaction(async (tx) => {
            // Step 3: Compute totalRevenue and gather dry-run FIFO data
            let totalRevenue = 0;
            let totalCogs = 0;
            const itemBatchPreviews: { item: typeof input.items[0], batches: Awaited<ReturnType<InventoryService['deductStockFIFO']>> }[] = [];

            for (const item of input.items) {
                totalRevenue += Number(item.sellPrice) * item.quantity;

                // Get FIFO preview (dry-run)
                const batches = await this.inventoryService.deductStockFIFO(
                    item.productId,
                    item.quantity,
                    'DRY_RUN', // temporary ID
                    tx,
                    { dryRun: true }
                );

                let itemCogs = 0;
                for (const batch of batches) {
                    itemCogs += batch.quantityTaken * Number(batch.buyPrice);
                }
                totalCogs += itemCogs;
                itemBatchPreviews.push({ item, batches });
            }

            const grossProfit = totalRevenue - totalCogs;

            // Step 4: Create sale record with financials
            const newSale = await this.repository.createSale({
                customerId: input.customerId ?? null,
                totalAmount: totalRevenue,
                revenue: totalRevenue,
                cogs: totalCogs,
                grossProfit,
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
                    sellPrice: preview.item.sellPrice,
                }, tx);

                // c) Record each consumed batch
                for (const batch of batches) {
                    await this.repository.createSaleItemBatch({
                        saleItemId: saleItem.id,
                        batchId: batch.batchId,
                        quantity: batch.quantityTaken,
                        sellPrice: preview.item.sellPrice,
                        costPrice: batch.buyPrice,
                    }, tx);
                }
            }
        });

        return finalSaleId;
    }
}
