import { stockLedger } from '@my-saas-app/db';
import { Database, TenantRepository } from '../../../core/database/tenant-repository-base.js';

/**
 * Repository for Stock Ledger operations.
 * Pure data layer for tracking all stock movements (FIFO Step 2).
 */
export class StockLedgerRepository extends TenantRepository {
    constructor(db: Database, tenantId: string) {
        super(db, tenantId);
    }

    /**
     * createEntry
     * Inserts a raw entry into the stock_ledger table.
     */
    async createEntry(data: {
        productId: string;
        batchId?: string | null | undefined;
        type: 'IN' | 'OUT' | 'ADJUSTMENT';
        quantity: number;
        reference?: string | null | undefined;
    }, tx?: any) {
        const client = tx || this.db;
        
        const [record] = await client
            .insert(stockLedger)
            .values({
                tenantId: this.tenantId,
                productId: data.productId,
                batchId: data.batchId ?? null,
                type: data.type,
                quantity: data.quantity,
                reference: data.reference ?? null,
            })
            .returning();
            
        return record;
    }

    /**
     * recordStockIn
     * Records stock coming IN. Enforces positive quantity.
     */
    async recordStockIn(params: {
        productId: string;
        batchId?: string | null | undefined;
        quantity: number;
        reference?: string | null | undefined;
    }, tx?: any) {
        if (params.quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }
        return this.createEntry({
            ...params,
            type: 'IN',
            quantity: Math.abs(params.quantity),
        }, tx);
    }

    /**
     * recordStockOut
     * Records stock going OUT. Enforces positive quantity.
     * Movement direction is defined by type.
     */
    async recordStockOut(params: {
        productId: string;
        batchId?: string | null | undefined;
        quantity: number;
        reference?: string | null | undefined;
    }, tx?: any) {
        if (params.quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }
        return this.createEntry({
            ...params,
            type: 'OUT',
            quantity: Math.abs(params.quantity),
        }, tx);
    }
}
