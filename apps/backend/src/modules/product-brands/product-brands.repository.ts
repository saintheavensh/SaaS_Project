import { eq, and } from 'drizzle-orm';
import { Database, TenantRepository } from '../../core/database/tenant-repository-base.js';
import { productBrands } from '@my-saas-app/db';
import { Brand, CreateBrandInput, UpdateBrandInput } from './types.js';

/**
 * Repository for Product Brand operations
 */
export class ProductBrandRepository extends TenantRepository {
  constructor(db: Database, tenantId: string) {
    super(db, tenantId);
  }

  /**
   * Get all productBrands for the current tenant
   */
  async getBrands(): Promise<Brand[]> {
    return this.db
      .select()
      .from(productBrands)
      .where(eq(productBrands.tenantId, this.tenantId));
  }

  /**
   * Get a single brand by ID
   */
  async getBrandById(id: string): Promise<Brand | null> {
    const [result] = await this.db
      .select()
      .from(productBrands)
      .where(
        and(
          eq(productBrands.id, id),
          eq(productBrands.tenantId, this.tenantId)
        )
      );
    return result || null;
  }

  /**
   * Create a new brand
   */
  async createBrand(data: CreateBrandInput): Promise<Brand> {
    const [result] = await this.db
      .insert(productBrands)
      .values({
        ...data,
        tenantId: this.tenantId,
      })
      .returning();
    return result;
  }

  /**
   * Update an existing brand
   */
  async updateBrand(id: string, data: UpdateBrandInput): Promise<Brand | null> {
    const [result] = await this.db
      .update(productBrands)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(productBrands.id, id),
          eq(productBrands.tenantId, this.tenantId)
        )
      )
      .returning();
    return result || null;
  }

  /**
   * Delete a brand
   */
  async deleteBrand(id: string): Promise<boolean> {
    const result = await this.db
      .delete(productBrands)
      .where(
        and(
          eq(productBrands.id, id),
          eq(productBrands.tenantId, this.tenantId)
        )
      )
      .returning();
    return result.length > 0;
  }
}
