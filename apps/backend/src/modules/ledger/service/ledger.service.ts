import { LedgerRepository } from '../repository/ledger.repository.js';
import { InventoryRepository } from '../../inventory/repository.js';
import { ledgerEmitter, LedgerEvent, LedgerEventPayload } from '../events/index.js';
import { db } from '../../../core/db.js';
import { InsufficientStockError } from '../../../core/errors/insufficient-stock.error.js';

export class LedgerService {
    constructor(
        private readonly tenantId: string,
        private readonly ledgerRepo: LedgerRepository,
        private readonly inventoryRepo: InventoryRepository
    ) {}

    /**
     * Log a stock change and update the snapshot stock atomically.
     * Emits STOCK_MOVED on success.
     */
    async logStockChange(productId: string, batchId: string, delta: number) {
        await db.transaction(async (tx: any) => {
            // 1. update batch stock
            const batchUpdated = await this.inventoryRepo.updateBatchStockDelta(batchId, delta, tx);
            if (batchUpdated === 0) {
                throw new InsufficientStockError(`Insufficient stock for batch ${batchId}`);
            }

            // 2. update inventory stock
            const productUpdated = await this.inventoryRepo.updateStockDelta(productId, delta, tx);
            if ((productUpdated as any).affectedRows === 0) {
                throw new InsufficientStockError(`Insufficient stock for product ${productId}`);
            }

            // 3. insert ledger movement record
            await this.ledgerRepo.recordStockMovement(
                productId,
                batchId,
                delta,
                'ADJUSTMENT',
                undefined,
                tx
            );
        });

        // Emit standard payload
        const payload: LedgerEventPayload = {
            tenantId: this.tenantId,
            productId,
            batchId,
            delta,
            timestamp: new Date(),
        };
        ledgerEmitter.emit(LedgerEvent.STOCK_MOVED, payload);
    }

    /**
     * Finalize an opname session by comparing counted stock with system stock,
     * recording the difference as a movement, and emitting OPNAME_FINALIZED.
     */
    async finalizeOpnameSession(productId: string, batchId: string, systemStock: number, countedStock: number) {
        const delta = countedStock - systemStock;

        if (delta !== 0) {
            await db.transaction(async (tx: any) => {
                // 1. update batch stock
                const batchUpdated = await this.inventoryRepo.updateBatchStockDelta(batchId, delta, tx);
                if (batchUpdated === 0) {
                    throw new InsufficientStockError(`Insufficient stock for batch ${batchId}`);
                }

                // 2. update inventory stock
                const productUpdated = await this.inventoryRepo.updateStockDelta(productId, delta, tx);
                if ((productUpdated as any).affectedRows === 0) {
                    throw new InsufficientStockError(`Insufficient stock for product ${productId}`);
                }

                // 3. insert ledger movement record
                await this.ledgerRepo.recordStockMovement(
                    productId,
                    batchId,
                    delta,
                    'OPNAME',
                    undefined,
                    tx
                );
            });
        }

        // Emit standard payload
        const payload: LedgerEventPayload = {
            tenantId: this.tenantId,
            productId,
            batchId,
            delta,
            timestamp: new Date(),
        };
        ledgerEmitter.emit(LedgerEvent.OPNAME_FINALIZED, payload);
    }
}
