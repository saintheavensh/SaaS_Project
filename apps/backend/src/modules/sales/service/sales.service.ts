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
    ) {}

    /**
     * Creates a sale transaction
     */
    async createSale(input: CreateSaleInput): Promise<string> {
        // Calculate total amount from items ensuring numeric consistency
        const totalAmount = input.items.reduce(
            (sum, item) => sum + Number(item.sellPrice) * item.quantity,
            0
        );

        let finalSaleId: string = '';

        await db.transaction(async (tx) => {
            // 1. Create sale record
            const newSale = await this.repository.createSale({
                customerId: input.customerId ?? null,
                totalAmount,
                status: 'COMPLETED' satisfies SaleStatus,
            }, tx);

            finalSaleId = newSale.id;

            // 2. Loop through items
            for (const item of input.items) {
                // a) Call FIFO deduction
                const batches = await this.inventoryService.deductStockFIFO(
                    item.productId,
                    item.quantity,
                    newSale.id,
                    tx
                );

                // b) Create sale item record
                const saleItem = await this.repository.createSaleItem({
                    saleId: newSale.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    sellPrice: item.sellPrice,
                }, tx);

                // c) Record each consumed batch
                for (const batch of batches) {
                    await this.repository.createSaleItemBatch({
                        saleItemId: saleItem.id,
                        batchId: batch.batchId,
                        quantity: batch.quantity,
                        buyPrice: batch.buyPrice,
                    }, tx);
                }
            }
        });

        return finalSaleId;
    }
}
