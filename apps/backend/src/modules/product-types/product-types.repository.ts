import { eq, and } from 'drizzle-orm';
import { Database, TenantRepository } from '../../core/database/tenant-repository-base.js';
import { productTypes } from '@my-saas-app/db';
import { ProductType, CreateProductTypeInput, UpdateProductTypeInput } from './types.js';

/**
 * Repository for Product Types operations
 */
export class ProductTypesRepository extends TenantRepository {
  constructor(db: Database, tenantId: string) {
    super(db, tenantId);
  }

  /**
   * Get all product types for the current tenant
   */
  async findAll(): Promise<ProductType[]> {
    return this.db
      .select()
      .from(productTypes)
      .where(eq(productTypes.tenantId, this.tenantId));
  }

  /**
   * Get a single product type by ID
   */
  async findById(id: string): Promise<ProductType | null> {
    const [result] = await this.db
      .select()
      .from(productTypes)
      .where(
        and(
          eq(productTypes.id, id),
          eq(productTypes.tenantId, this.tenantId)
        )
      );
    return result || null;
  }

  /**
   * Get all product types for a specific category
   */
  async findByCategory(categoryId: string): Promise<ProductType[]> {
    return this.db
      .select()
      .from(productTypes)
      .where(
        and(
          eq(productTypes.categoryId, categoryId),
          eq(productTypes.tenantId, this.tenantId)
        )
      );
  }

  /**
   * Find a product type by name and category for uniqueness check
   */
  async findByNameAndCategory(name: string, categoryId: string): Promise<ProductType | null> {
    const [result] = await this.db
      .select()
      .from(productTypes)
      .where(
        and(
          eq(productTypes.name, name),
          eq(productTypes.categoryId, categoryId),
          eq(productTypes.tenantId, this.tenantId)
        )
      );
    return result || null;
  }

  /**
   * Create a new product type
   */
  async create(data: CreateProductTypeInput): Promise<ProductType> {
    const [result] = await this.db
      .insert(productTypes)
      .values({
        ...data,
        tenantId: this.tenantId,
      })
      .returning();
    return result;
  }

  /**
   * Update an existing product type
   */
  async update(id: string, data: UpdateProductTypeInput): Promise<ProductType | null> {
    const [result] = await this.db
      .update(productTypes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(productTypes.id, id),
          eq(productTypes.tenantId, this.tenantId)
        )
      )
      .returning();
    return result || null;
  }

  /**
   * Delete a product type
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(productTypes)
      .where(
        and(
          eq(productTypes.id, id),
          eq(productTypes.tenantId, this.tenantId)
        )
      )
      .returning();
    return result.length > 0;
  }
}
