import { EventEmitter } from 'events';

export const inventoryEmitter = new EventEmitter();

export enum InventoryEvent {
    STOCK_UPDATED = 'stock.updated',
    STOCK_DEDUCTED = 'stock.deducted',
    OPNAME_FINALIZED = 'opname.finalized',
}

export interface InventoryEventPayload {
    tenantId: string;
    productId: string;
    delta?: number;
    newStock?: string;
    metadata?: any;
}
