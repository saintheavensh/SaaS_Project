import { inventoryEmitter, InventoryEvent, InventoryEventPayload } from './index.js';

/**
 * Initialize all inventory event consumers
 */
export const initInventoryConsumers = () => {
    // 1. Ledger Update Consumer (Placeholder)
    inventoryEmitter.on(InventoryEvent.STOCK_DEDUCTED, (payload: InventoryEventPayload) => {
        console.log(`[Ledger] STOCK_DEDUCTED: Tenant ${payload.tenantId}, Product ${payload.productId}, Delta ${payload.delta}, New Stock ${payload.newStock}`);
        // In a real app, this would write to an immutable stock_movements table.
    });

    inventoryEmitter.on(InventoryEvent.STOCK_UPDATED, (payload: InventoryEventPayload) => {
        console.log(`[Ledger] STOCK_UPDATED: Tenant ${payload.tenantId}, Product ${payload.productId}, Delta ${payload.delta}, New Stock ${payload.newStock}`);
    });

    // 2. Low Stock Alert Consumer (Placeholder)
    inventoryEmitter.on(InventoryEvent.STOCK_DEDUCTED, (payload: InventoryEventPayload) => {
        // Simple threshold check
        if (payload.newStock && parseFloat(payload.newStock) < 10) {
            console.warn(`[Alert] LOW_STOCK: Tenant ${payload.tenantId}, Product ${payload.productId} is below threshold! current: ${payload.newStock}`);
        }
    });
};
