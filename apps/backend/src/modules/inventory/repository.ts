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
     * Get snapshot stock for a specific product
     */
    async getStockByProductId(productId: string) {
        const [product] = await this.db
            .select({ stock: products.stock })
            .from(products)
            .where(
                and(
                    this.tenantWhere(products.tenantId),
                    eq(products.id, productId)
                )
            )
            .limit(1);
        
        return product ? product.stock : 0;
    }

    /**
     * Update product stock by a delta atomically.
     * Prevents race conditions by checking in SQL if stock is sufficient.
     */
    async updateStockDelta(productId: string, delta: number, tx?: Database) {
        const client = tx || this.db;
        
        // If delta is negative (deduction), ensure we don't go below 0
        const condition = delta < 0 
            ? sql`${products.stock} + ${delta} >= 0` 
            : undefined;

        const result = await client
            .update(products)
            .set({
                stock: sql`${products.stock} + ${delta}`,
                updatedAt: new Date(),
            })
            .where(
                and(
                    this.tenantWhere(products.tenantId),
                    eq(products.id, productId),
                    condition
                )
            )
            .returning({ id: products.id, stock: products.stock });
        
        return {
            affectedRows: result.length,
            newStock: result.length > 0 ? result[0].stock : null
        };
    }

    /**
     * Insert a new product batch
     */
    async insertBatch(batchData: {
        productId: string;
        buyPrice: string;
        sellPrice: string;
        initialStock: number;
        currentStock: number;
    }, tx?: Database) {
        const client = tx || this.db;
        const [newBatch] = await client
            .insert(batches)
            .values({
                tenantId: this.tenantId,
                ...batchData,
            })
            .returning();
        
        return newBatch;
    }

    /**
     * Update batch currentStock by a delta atomically.
     * Prevents race conditions by checking in SQL if stock is sufficient.
     */
    async updateBatchStockDelta(batchId: string, delta: number, tx?: Database) {
        const client = tx || this.db;
        
        // Ensure we don't go below 0 for deductions
        const condition = delta < 0 
            ? sql`${batches.currentStock} + ${delta} >= 0` 
            : undefined;

        const result = await client
            .update(batches)
            .set({
                currentStock: sql`${batches.currentStock} + ${delta}`,
                updatedAt: new Date(),
            })
            .where(
                and(
                    this.tenantWhere(batches.tenantId),
                    eq(batches.id, batchId),
                    condition
                )
            )
            .returning({ id: batches.id });
        
        return result.length;
    }

    /**
     * Get available batches for a product ordered by FIFO (oldest first).
     * Only returns batches with currentStock > 0.
     */
    async getAvailableBatchesFIFO(productId: string, tx?: Database) {
        const client = tx || this.db;

        return client
            .select({
                id: batches.id,
                productId: batches.productId,
                currentStock: batches.currentStock,
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
     * Decrease batch stock by an exact quantity.
     * Guarded in SQL: currentStock - quantity >= 0.
     * Returns the updated batch record or null if stock insufficient.
     */
    async decreaseBatchStock(batchId: string, quantity: number, tx?: Database) {
        const client = tx || this.db;

        const [updated] = await client
            .update(batches)
            .set({
                currentStock: sql`${batches.currentStock} - ${quantity}`,
                updatedAt: new Date(),
            })
            .where(
                and(
                    this.tenantWhere(batches.tenantId),
                    eq(batches.id, batchId),
                    sql`${batches.currentStock} - ${quantity} >= 0`
                )
            )
            .returning({
                id: batches.id,
                currentStock: batches.currentStock,
                buyPrice: batches.buyPrice,
            });

        return updated ?? null;
    }
}

