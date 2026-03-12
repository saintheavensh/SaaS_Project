import { eq, and, InferSelectModel } from 'drizzle-orm';
import { Database, TenantRepository } from '../../core/database/tenant-repository-base.js';
import { products } from '@my-saas-app/db';

type ProductTable = typeof products;

/**
 * Repository for Products operations, enforcing tenant isolation.
 */
export class ProductsRepository extends TenantRepository {
    constructor(db: Database, tenantId: string) {
        super(db, tenantId);
    }

    /**
     * Get a product by ID
     */
    async getProductById(productId: string) {
        const [product] = await this.db
            .select()
            .from(products)
            .where(
                and(
                    this.tenantWhere(products.tenantId),
                    eq(products.id, productId)
                )
            )
            .limit(1);
        
        return product || null;
    }

    /**
     * Insert a new product
     */
    async insertProduct(productData: {
        name: string;
        description?: string | null | undefined;
        categoryId?: string | null | undefined;
    }) {
        const [newProduct] = await this.db
            .insert(products)
            .values({
                tenantId: this.tenantId,
                name: productData.name,
                description: productData.description ?? null,
                categoryId: productData.categoryId ?? null,
            })
            .returning();
        
        return newProduct;
    }

    /**
     * Update an existing product
     */
    async updateProduct(productId: string, updateData: {
        name?: string | undefined;
        description?: string | null | undefined;
        categoryId?: string | null | undefined;
        updatedAt: Date;
    }) {
        const [updatedProduct] = await this.db
            .update(products)
            .set(updateData as any)
            .where(
                and(
                    this.tenantWhere(products.tenantId),
                    eq(products.id, productId)
                )
            )
            .returning();
        
        return updatedProduct || null;
    }
}
