import { InventoryRepository } from './repository.js';
import { StockLedgerRepository } from '../ledger/repository/stock-ledger.repository.js';
import { db } from '../../core/db.js';
import { InsufficientStockError } from '../../core/errors/insufficient-stock.error.js';

/**
 * InventoryService
 * Synchronizes stock_ledger (history) with batches (state).
 * Step 3 — Sync with Batches (MANDATORY MINIMAL)
 */
export class InventoryService {
    constructor(
        private readonly tenantId: string,
        private readonly inventoryRepo: InventoryRepository,
        private readonly stockLedgerRepo: StockLedgerRepository
    ) { }

    /**
     * handleStockIn
     * 1. start transaction
     * 2. create NEW batch
     * 3. record stock ledger (type: IN)
     * 4. commit
     */
    async handleStockIn(params: {
        productId: string;
        buyPrice: string;
        quantity: number;
        reference?: string | null;
    }, tx?: any) {
        if (params.quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }

        const execute = async (transaction: any) => {
            // 1. Create a new batch for this stock-in
            const newBatch = await this.inventoryRepo.createBatch({
                productId: params.productId,
                buyPrice: params.buyPrice,
                initialStock: params.quantity,
            }, transaction);

            // 2. Record movement in history
            await this.stockLedgerRepo.recordStockIn({
                productId: params.productId,
                batchId: newBatch.id,
                quantity: params.quantity,
                reference: params.reference ?? null,
            }, transaction);

            return newBatch;
        };

        return tx ? await execute(tx) : await db.transaction(async (newTx) => await execute(newTx));
    }

    /**
     * handleStockOut
     * 1. start transaction (unless tx provided)
     * 2. fetch available batches (ordered oldest first)
     * 3. pick ONLY ONE batch
     * 4. validate stock is sufficient
     * 5. reduce current_stock
     * 6. record stock ledger (type: OUT)
     * 7. commit
     */
    async handleStockOut(params: {
        productId: string;
        quantity: number;
        reference?: string | null;
    }, tx?: any) {
        if (params.quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }

        const execute = async (transaction: any) => {
            // 1. Find available batches (FIFO ordering)
            const availableBatches = await this.inventoryRepo.getFifoBatches(params.productId);
            
            // 2. Pick only one batch
            if (availableBatches.length === 0) {
                throw new InsufficientStockError(`No batches available for product ${params.productId}`);
            }

            const batch = availableBatches[0];

            // 3. Validate stock is sufficient
            if (batch.remainingQuantity < params.quantity) {
                throw new InsufficientStockError(
                    `Insufficient stock in batch ${batch.id}. Available: ${batch.remainingQuantity}, Requested: ${params.quantity}`
                );
            }

            // 4. Reduce current_stock
            const newStock = batch.remainingQuantity - params.quantity;
            await this.inventoryRepo.updateBatchStock(batch.id, newStock, transaction);

            // 5. Record movement in history
            await this.stockLedgerRepo.recordStockOut({
                productId: params.productId,
                batchId: batch.id,
                quantity: params.quantity,
                reference: params.reference ?? null,
            }, transaction);

            return { batchId: batch.id, remainingStock: newStock };
        };

        return tx ? await execute(tx) : await db.transaction(async (newTx) => await execute(newTx));
    }
}
