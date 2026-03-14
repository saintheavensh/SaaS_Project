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

            // TODO: Step 4 - Insert sale record
            // TODO: Step 5 - Create items and batches
        });

        return finalSaleId;
    }
}
