import { EventEmitter } from 'events';

export enum LedgerEvent {
    STOCK_MOVED = 'STOCK_MOVED',
    OPNAME_FINALIZED = 'OPNAME_FINALIZED',
}

export interface LedgerEventPayload {
    tenantId: string;
    productId: string;
    batchId: string;
    delta: number;
    timestamp: Date;
}

class LedgerEmitter extends EventEmitter {}
export const ledgerEmitter = new LedgerEmitter();
