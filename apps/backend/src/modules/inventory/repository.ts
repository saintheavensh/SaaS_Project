import { eq, and, sql, gt, asc } from 'drizzle-orm';
import { Database, TenantRepository } from '../../core/database/tenant-repository-base.js';
import { products, batches } from '@my-saas-app/db';

/**
 * Repository for Inventory operations, enforcing tenant isolation.
 */
export class InventoryRepository extends TenantRepository {
    constructor(db: Database, tenantId: string) {
        super(db, tenantId);
    }

    /**
     * getFifoBatches(productId: string)
     * [STRICT MODE] [READ ONLY]
     * Fetches available batches for a specific product, ordered by creation date (FIFO).
     * Order: oldest first.
     */
    async getFifoBatches(productId: string) {
        return this.db
            .select({
                id: batches.id,
                productId: batches.productId,
                remainingQuantity: batches.currentStock,
                buyPrice: batches.buyPrice,
                createdAt: batches.createdAt,
            })
            .from(batches)
            .where(
                and(
                    this.tenantWhere(batches.tenantId),
                    eq(batches.productId, productId),
                    gt(batches.currentStock, 0)
                )
            )
            .orderBy(asc(batches.createdAt));
    }

    /**
     * updateStockDelta(productId: string, delta: number, tx?: any)
     * [TEMP] Added for compilation only.
     */
    async updateStockDelta(productId: string, delta: number, tx?: any): Promise<any> {
        throw new Error("NOT_IMPLEMENTED_YET");
    }

    /**
     * updateBatchStockDelta(batchId: string, delta: number, tx?: any)
     * [TEMP] Added for compilation only.
     */
    async updateBatchStockDelta(batchId: string, delta: number, tx?: any): Promise<any> {
        throw new Error("NOT_IMPLEMENTED_YET");
    }
}
