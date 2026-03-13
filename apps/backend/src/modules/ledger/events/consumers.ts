import { ledgerEmitter, LedgerEvent, LedgerEventPayload } from './index.js';

/**
 * Initialize all ledger event consumers.
 * Used for cross-module integration (e.g., analytics, notifications).
 */
export const initLedgerConsumers = () => {
    // Analytics/Audit Consumer
    ledgerEmitter.on(LedgerEvent.STOCK_MOVED, (payload: LedgerEventPayload) => {
        console.log(`[Ledger Analytics] STOCK_MOVED: Tenant ${payload.tenantId}, Product ${payload.productId}, Batch ${payload.batchId}, Delta ${payload.delta}, Time ${payload.timestamp.toISOString()}`);
    });

    // Opname Audit Consumer
    ledgerEmitter.on(LedgerEvent.OPNAME_FINALIZED, (payload: LedgerEventPayload) => {
        console.log(`[Ledger Audit] OPNAME_FINALIZED: Tenant ${payload.tenantId}, Product ${payload.productId}, Batch ${payload.batchId}, Discrepancy ${payload.delta}, Time ${payload.timestamp.toISOString()}`);
    });
};
