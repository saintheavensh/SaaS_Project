import { eq, and, desc } from 'drizzle-orm';
import { stockMovements } from '@my-saas-app/db';
import { TenantRepository, Database } from '../../../core/database/tenant-repository-base.js';

/**
 * Repository for Ledger operations.
 * Enforces tenant isolation and append-only rules.
 */
export class LedgerRepository extends TenantRepository {
    constructor(db: Database, tenantId: string) {
        super(db, tenantId);
    }

    /**
     * Record a new stock movement.
     * Ledger is append-only. No updates or deletes allowed.
     */
    async recordStockMovement(
        productId: string,
        batchId: string,
        delta: number,
        movementType: 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'OPNAME' = 'ADJUSTMENT',
        referenceId?: string,
        tx?: Database // Optional Drizzle transaction client
    ) {
        const client = tx || this.db;
        
        const [record] = await client
            .insert(stockMovements)
            .values({
                tenantId: this.tenantId,
                productId,
                batchId,
                delta,
                movementType,
                referenceId: referenceId ?? null,
            })
            .returning();
            
        return record;
    }

    /**
     * Get stock validation history by product.
     * Always scopes down to current tenant.
     */
    async getMovementsByProduct(productId: string) {
        return this.db
            .select()
            .from(stockMovements)
            .where(
                and(
                    this.tenantWhere(stockMovements.tenantId),
                    eq(stockMovements.productId, productId)
                )
            )
            .orderBy(desc(stockMovements.createdAt));
    }
}
