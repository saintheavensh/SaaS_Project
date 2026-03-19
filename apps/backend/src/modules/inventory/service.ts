import { InventoryRepository } from './repository.js';
import { StockLedgerRepository } from '../ledger/repository/stock-ledger.repository.js';
import { db } from '../../core/db.js';
import { InsufficientStockError } from '../../core/errors/insufficient-stock.error.js';
import { ValidationError } from '../../core/errors/validation.error.js';
import { NotFoundError } from '../../core/errors/not-found.error.js';
import { Database } from '../../core/database/tenant-repository-base.js';

const SYSTEM_UNKNOWN_SUPPLIER_ID = '00000000-0000-0000-0000-000000000000';

export type ConsumedBatch = {
    batchId: string;
    quantity: number;
    buyPrice: string;
};

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
        supplierId?: string; // Optional in API to maintain contract
        sellPrice?: string;  // Optional in API to maintain contract
        reference?: string | null;
    }, tx?: Database) {
        this.validateQuantity(params.quantity);

        const execute = async (transaction: Database) => {
            await this.validateProductExists(params.productId, transaction);

            // 1. Create a new batch for this stock-in
            const newBatch = await this.inventoryRepo.createBatch({
                productId: params.productId,
                buyPrice: params.buyPrice,
                initialStock: params.quantity,
                // Hardening: Provide placeholders if not supplied, though API should ideally provide them
                supplierId: params.supplierId ?? SYSTEM_UNKNOWN_SUPPLIER_ID,
                sellPrice: params.sellPrice ?? params.buyPrice, 
            }, transaction);

            // 2. Record movement in history
            await this.stockLedgerRepo.recordStockIn({
                productId: params.productId,
                batchId: newBatch.id,
                quantity: params.quantity,
                buyPrice: params.buyPrice, // Pass buyPrice for COGS
                reference: params.reference ?? null,
            }, transaction);

            return newBatch;
        };

        return tx ? await execute(tx) : await db.transaction(async (newTx) => await execute(newTx));
    }

    /**
     * handleStockOut
     * [CRITICAL] 
     * 1. Requires mandatory transaction (tx)
     * 2. Fetches available batches with FOR UPDATE locking
     * 3. Validates stock is sufficient
     * 4. Deducts stock with defensive check
     */
    async handleStockOut(params: {
        productId: string;
        quantity: number;
        reference?: string | null;
    }, tx: Database): Promise<ConsumedBatch[]> {
        if (!tx) {
            throw new Error('Transaction (tx) is required for handleStockOut to ensure concurrency safety');
        }

        this.validateQuantity(params.quantity);
        await this.validateProductExists(params.productId, tx);

        // 1. Find all available batches (FIFO ordering + ROW LOCKING)
        const availableBatches = await this.inventoryRepo.getFifoBatchesForUpdate(params.productId, tx);
        
        // 2. Early Fail: Check total available stock across all batches
        const totalAvailable = availableBatches.reduce((acc, b) => acc + b.remainingQuantity, 0);
        if (totalAvailable < params.quantity) {
            throw new InsufficientStockError(
                `Insufficient total stock for product ${params.productId}. Available: ${totalAvailable}, Requested: ${params.quantity}`
            );
        }

        let remainingToConsume = params.quantity;
        const consumedBatches: ConsumedBatch[] = [];

        // 3. Consume from batches in order (FIFO)
        for (const batch of availableBatches) {
            if (remainingToConsume <= 0) break;

            const consumed = Math.min(batch.remainingQuantity, remainingToConsume);
            if (consumed > 0) {
                const newStock = batch.remainingQuantity - consumed;
                
                // a) Update batch state (with defensive check)
                await this.inventoryRepo.updateBatchStock(batch.id, consumed, newStock, tx);

                // b) Record movement in history for this specific batch
                await this.stockLedgerRepo.recordStockOut({
                    productId: params.productId,
                    batchId: batch.id,
                    quantity: consumed,
                    buyPrice: batch.buyPrice, // Pass batch buyPrice for COGS
                    reference: params.reference ?? null,
                }, tx);

                consumedBatches.push({
                    batchId: batch.id,
                    quantity: consumed,
                    buyPrice: batch.buyPrice,
                });

                remainingToConsume -= consumed;
            }
        }

        return consumedBatches;
    }

    /**
     * validateQuantity
     * Standardized validation for quantity.
     */
    private validateQuantity(quantity: number) {
        if (quantity <= 0) {
            throw new ValidationError('Quantity must be greater than 0');
        }
    }

    /**
     * validateProductExists
     * Standardized validation for product existence.
     */
    private async validateProductExists(productId: string, tx: Database) {
        const exists = await this.inventoryRepo.checkProductExists(productId, tx);
        if (!exists) {
            throw new NotFoundError(`Product ${productId} not found`);
        }
    }
}
