import { InventoryRepository } from './repository.js';
import { inventoryEmitter, InventoryEvent, InventoryEventPayload } from './events/index.js';
import { InsufficientStockError } from '../../core/errors/insufficient-stock.error.js';
import { LedgerRepository } from '../ledger/repository/ledger.repository.js';
import { db } from '../../core/db.js';
import { Database } from '../../core/database/tenant-repository-base.js';

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
     * Deduct stock using FIFO batch ordering.
     * Consumes oldest batches first until the requested quantity is fulfilled.
     * All operations are fully transactional — if any step fails, everything rolls back.
     *
     * Flow per batch:
     *   1. Determine takeQty = min(batch.currentStock, remainingQty)
     *   2. Decrease batch stock atomically
     *   3. Record ledger movement (SALE)
     *   4. Collect deduction detail for COGS tracking
     *
     * After FIFO loop: update product snapshot stock.
     */
    async deductStockFIFO(productId: string, quantity: number, saleId: string, tx?: Database): Promise<BatchDeduction[]> {
        if (quantity <= 0 || !Number.isInteger(quantity)) {
            throw new Error('Quantity must be a positive integer');
        }

        if (!this.ledgerRepo) {
            throw new Error('LedgerRepository is required for FIFO deduction');
        }

        const deductions: BatchDeduction[] = [];
        let finalStock: number | null = null;

        const operation = async (dbTx: Database) => {
            // 1. Fetch available batches ordered oldest-first
            const availableBatches = await this.repository.getAvailableBatchesFIFO(productId, dbTx);

            let remainingQty = quantity;

            // 2. FIFO deduction loop
            for (const batch of availableBatches) {
                if (remainingQty <= 0) break;

                const takeQty = Math.min(batch.currentStock, remainingQty);

                // 3. Decrease batch stock atomically
                const updated = await this.repository.decreaseBatchStock(batch.id, takeQty, dbTx);
                if (!updated) {
                    // Concurrent modification — skip this batch, try next
                    continue;
                }

                // 4. Record ledger movement
                await this.ledgerRepo!.recordStockMovement(
                    productId,
                    batch.id,
                    -takeQty,
                    'SALE',
                    saleId,
                    dbTx
                );

                // 5. Collect deduction detail
                deductions.push({
                    batchId: batch.id,
                    quantity: takeQty,
                    buyPrice: batch.buyPrice,
                });

                remainingQty -= takeQty;
            }

            // 6. Guard: if we couldn't fulfill the entire quantity, roll back
            if (remainingQty > 0) {
                throw new InsufficientStockError(
                    `Insufficient stock for product ${productId}. Short by ${remainingQty} units.`
                );
            }

            // 7. Update product snapshot stock
            const stockResult = await this.repository.updateStockDelta(productId, -quantity, dbTx);
            if (stockResult.affectedRows === 0) {
                throw new InsufficientStockError(
                    `Failed to update snapshot stock for product ${productId}`
                );
            }
            finalStock = stockResult.newStock;
        };

        if (tx) {
            await operation(tx);
        } else {
            await db.transaction(operation);
        }

        // Emit event only after successful commit
        const payload: InventoryEventPayload = {
            tenantId: this.tenantId,
            productId,
            delta: -quantity,
            newStock: finalStock,
            metadata: { saleId, deductions },
        };
        inventoryEmitter.emit(InventoryEvent.STOCK_DEDUCTED, payload);

        return deductions;
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

/**
 * Represents a single batch deduction in a FIFO sale.
 * Used for COGS calculation and audit trail.
 */
export interface BatchDeduction {
    batchId: string;
    quantity: number;
    buyPrice: string;
}
