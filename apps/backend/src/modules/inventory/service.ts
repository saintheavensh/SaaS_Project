import { InventoryRepository } from './repository.js';
import { inventoryEmitter, InventoryEvent, InventoryEventPayload } from './events/index.js';
import { InsufficientStockError } from '../../core/errors/insufficient-stock.error.js';

/**
 * Service for Inventory business logic.
 */
export class InventoryService {
    constructor(private readonly tenantId: string, private readonly repository: InventoryRepository) {}

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
     * Add stock from a new purchase batch
     */
    async addStockFromPurchase(batchData: {
        productId: string;
        buyPrice: string;
        sellPrice: string;
        initialStock: number;
    }) {
        // 1. Insert Batch
        const newBatch = await this.repository.insertBatch({
            ...batchData,
            currentStock: batchData.initialStock,
        });

        // 2. Update Product Stock (Snapshot) — no parseFloat needed, already numeric
        const result = await this.repository.updateStockDelta(batchData.productId, batchData.initialStock);

        if (result.affectedRows === 0) {
            throw new Error(`InventoryService: Failed to update stock for product ${batchData.productId}`);
        }

        // Emit event
        const payload: InventoryEventPayload = {
            tenantId: this.tenantId,
            productId: batchData.productId,
            delta: batchData.initialStock,
            newStock: result.newStock,
            metadata: { batchId: newBatch.id },
        };
        inventoryEmitter.emit(InventoryEvent.STOCK_UPDATED, payload);

        return { batch: newBatch, productResult: result };
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
