import { InventoryRepository } from './repository.js';
import { inventoryEmitter, InventoryEvent, InventoryEventPayload } from './events/index.js';
import { InsufficientStockError } from '../../core/errors/insufficient-stock.error.js';
import { LedgerRepository } from '../ledger/repository/ledger.repository.js';
import { db } from '../../core/db.js';

/**
 * Service for Inventory business logic.
 */
export class InventoryService {
    constructor(
        private readonly tenantId: string,
        private readonly repository: InventoryRepository,
        private readonly ledgerRepo?: LedgerRepository
    ) {}

    /**
     * Deduct stock for a specific product
     */
    async deductStock(productId: string, quantity: number) {
        // Business logic for deduction
        const result = await this.repository.updateStockDelta(productId, -quantity);
        
        if (result.affectedRows === 0) {
            throw new InsufficientStockError(`Insufficient stock for product ${productId}`);
        }

        // Emit event
        const payload: InventoryEventPayload = {
            tenantId: this.tenantId,
            productId,
            delta: -quantity,
            newStock: result.newStock,
        };
        inventoryEmitter.emit(InventoryEvent.STOCK_DEDUCTED, payload);

        return result;
    }

    /**
     * Add stock from a new purchase batch.
     * All operations are wrapped in a single transaction:
     *   1. Insert batch
     *   2. Update product snapshot stock
     *   3. Record ledger movement
     * If any step fails, the entire transaction rolls back.
     */
    async addStockFromPurchase(batchData: {
        productId: string;
        buyPrice: string;
        sellPrice: string;
        initialStock: number;
    }) {
        let newBatch: Awaited<ReturnType<InventoryRepository['insertBatch']>>;
        let stockResult: Awaited<ReturnType<InventoryRepository['updateStockDelta']>>;

        await db.transaction(async (tx) => {
            // 1. Insert Batch
            newBatch = await this.repository.insertBatch({
                ...batchData,
                currentStock: batchData.initialStock,
            }, tx);

            // 2. Update Product Stock (Snapshot)
            stockResult = await this.repository.updateStockDelta(
                batchData.productId,
                batchData.initialStock,
                tx
            );

            if (stockResult.affectedRows === 0) {
                throw new Error(`InventoryService: Failed to update stock for product ${batchData.productId}`);
            }

            // 3. Record ledger movement inside same transaction
            if (this.ledgerRepo) {
                await this.ledgerRepo.recordStockMovement(
                    batchData.productId,
                    newBatch!.id,
                    batchData.initialStock,
                    'PURCHASE',
                    undefined,
                    tx
                );
            }
        });

        // Emit event only after transaction succeeds
        const payload: InventoryEventPayload = {
            tenantId: this.tenantId,
            productId: batchData.productId,
            delta: batchData.initialStock,
            newStock: stockResult!.newStock,
            metadata: { batchId: newBatch!.id },
        };
        inventoryEmitter.emit(InventoryEvent.STOCK_UPDATED, payload);

        return { batch: newBatch!, productResult: stockResult! };
    }

    /**
     * Finalize an opname session
     */
    async finalizeOpnameSession(sessionId: string) {
        // Logic to finalize opname session would go here.
        // For now, emitting an event as a placeholder for the audit flow.
        
        inventoryEmitter.emit(InventoryEvent.OPNAME_FINALIZED, {
            tenantId: this.tenantId,
            metadata: { sessionId },
        });

        return { success: true };
    }
}
