import { stockLedger } from '@my-saas-app/db';
import { Database, TenantRepository } from '../../../core/database/tenant-repository-base.js';
import { decimalToMinorUnit, minorUnitToDecimal } from '../../../core/utils/currency.js';

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
        buyPrice: string;
        reference?: string | null | undefined;
    }, tx?: Database) {
        const client = tx || this.db;
        
        const [record] = await client
            .insert(stockLedger)
            .values({
                tenantId: this.tenantId,
                productId: data.productId,
                batchId: data.batchId ?? null,
                type: data.type,
                quantity: data.quantity,
                buyPrice: data.buyPrice,
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
        buyPrice: string;
        reference?: string | null | undefined;
    }, tx?: Database) {
        if (params.quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }
        return this.createEntry({
            ...params,
            type: 'IN',
            quantity: Math.abs(params.quantity),
            buyPrice: params.buyPrice,
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
        buyPrice: string;
        reference?: string | null | undefined;
    }, tx?: Database) {
        if (params.quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }
        return this.createEntry({
            ...params,
            type: 'OUT',
            quantity: Math.abs(params.quantity),
            buyPrice: params.buyPrice,
        }, tx);
    }

    /**
     * getCOGSByReference
     * Calculates the total COGS for a specific reference (e.g. saleId).
     * Logic: sum(quantity * buyPrice) in minor units for exact precision.
     */
    async getCOGSByReference(reference: string, tx?: Database): Promise<string> {
        const client = tx || this.db;
        const { and, eq } = await import('drizzle-orm');

        const movements = await client
            .select({
                quantity: stockLedger.quantity,
                buyPrice: stockLedger.buyPrice,
            })
            .from(stockLedger)
            .where(
                and(
                    eq(stockLedger.tenantId, this.tenantId),
                    eq(stockLedger.type, 'OUT'),
                    eq(stockLedger.reference, reference)
                )
            );

        // Sum in minor units to avoid floating point errors
        const totalCogsMinor = movements.reduce((acc: number, move: { quantity: number; buyPrice: string }) => {
            const priceMinor = decimalToMinorUnit(move.buyPrice);
            return acc + (move.quantity * priceMinor);
        }, 0);

        return minorUnitToDecimal(totalCogsMinor);
    }
}
