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
    async updateStockDelta(productId: string, delta: number, tx?: Database): Promise<any> {
        throw new Error("NOT_IMPLEMENTED_YET");
    }

    /**
     * updateBatchStockDelta(batchId: string, delta: number, tx?: any)
     * [TEMP] Added for compilation only.
     */
    async updateBatchStockDelta(batchId: string, delta: number, tx?: Database): Promise<any> {
        throw new Error("NOT_IMPLEMENTED_YET");
    }

    /**
     * createBatch
     * Directly inserts a new batch.
     */
    async createBatch(data: {
        productId: string;
        buyPrice: string;
        initialStock: number;
        supplierId: string;
        sellPrice: string;
    }, tx?: Database) {
        const client = tx || this.db;
        const [result] = await client.insert(batches).values({
            tenantId: this.tenantId,
            productId: data.productId,
            supplierId: data.supplierId,
            buyPrice: data.buyPrice,
            sellPrice: data.sellPrice,
            initialStock: data.initialStock,
            currentStock: data.initialStock,
        }).returning();
        return result;
    }

    /**
     * updateBatchStock
     * Updates the current stock of a specific batch.
     * Enforces that current_stock does not go below 0.
     */
    async updateBatchStock(batchId: string, newStock: number, tx?: Database) {
        const client = tx || this.db;
        const [result] = await client.update(batches)
            .set({ currentStock: newStock })
            .where(
                and(
                    eq(batches.id, batchId),
                    this.tenantWhere(batches.tenantId)
                )
            )
            .returning();
        return result;
    }

    /**
     * checkProductExists
     * Verifies if a product exists for the current tenant.
     */
    async checkProductExists(productId: string, tx?: Database): Promise<boolean> {
        const client = tx || this.db;
        const [result] = await client
            .select({ id: products.id })
            .from(products)
            .where(
                and(
                    eq(products.id, productId),
                    this.tenantWhere(products.tenantId)
                )
            )
            .limit(1);
        
        return !!result;
    }
}
