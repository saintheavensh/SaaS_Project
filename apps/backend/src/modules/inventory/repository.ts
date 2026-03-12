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
     * Update product stock by a delta
     */
    async updateStockDelta(productId: string, delta: number) {
        const [updated] = await this.db
            .update(products)
            .set({
                stock: sql`${products.stock}::numeric + ${delta}`,
                updatedAt: new Date(),
            })
            .where(
                and(
                    this.tenantWhere(products.tenantId),
                    eq(products.id, productId)
                )
            )
            .returning();
        
        return updated;
    }

    /**
     * Insert a new product batch
     */
    async insertBatch(batchData: {
        productId: string;
        buyPrice: string;
        sellPrice: string;
        initialStock: string;
        currentStock: string;
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
}
