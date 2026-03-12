import { inventoryEmitter, InventoryEvent, InventoryEventPayload } from './index.js';
import { productsEmitter, ProductsEvent, ProductEventPayload } from '../../products/events/index.js';

/**
 * Initialize all inventory event consumers
 */
export const initInventoryConsumers = () => {
    // 1. Ledger Update Consumer (Placeholder)
    inventoryEmitter.on(InventoryEvent.STOCK_DEDUCTED, (payload: InventoryEventPayload) => {
        console.log(`[Inventory][Ledger] STOCK_DEDUCTED: Tenant ${payload.tenantId}, Product ${payload.productId}, Delta ${payload.delta}, New Stock ${payload.newStock}`);
    });

    inventoryEmitter.on(InventoryEvent.STOCK_UPDATED, (payload: InventoryEventPayload) => {
        console.log(`[Inventory][Ledger] STOCK_UPDATED: Tenant ${payload.tenantId}, Product ${payload.productId}, Delta ${payload.delta}, New Stock ${payload.newStock}`);
    });

    // 2. Low Stock Alert Consumer (Placeholder)
    inventoryEmitter.on(InventoryEvent.STOCK_DEDUCTED, (payload: InventoryEventPayload) => {
        if (payload.newStock && parseFloat(payload.newStock) < 10) {
            console.warn(`[Inventory][Alert] LOW_STOCK: Tenant ${payload.tenantId}, Product ${payload.productId} is below threshold! current: ${payload.newStock}`);
        }
    });

    // 3. Products Integration: Listen for ProductCreated
    productsEmitter.on(ProductsEvent.PRODUCT_CREATED, (payload: ProductEventPayload) => {
        console.log(`[Inventory][Integration] PRODUCT_CREATED: Initializing stock for Product ${payload.productId} (Tenant ${payload.tenantId})`);
        // Here we could automatically create an initial batch or snapshot for the product
    });
};
