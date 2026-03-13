import { eq, and, sql } from 'drizzle-orm';
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
        
        return product ? product.stock : '0';
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
    }) {
        const [newBatch] = await this.db
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
}
