import { eq, and } from 'drizzle-orm';
import { Database, TenantRepository } from '../../core/database/tenant-repository-base.js';
import { productDeviceCompatibility } from '@my-saas-app/db';
import { ProductDeviceCompatibility, CreateProductDeviceCompatibilityInput, UpdateProductDeviceCompatibilityInput } from './product-device-compatibility.types.js';

/**
 * Repository for Product-Device Compatibility operations
 */
export class ProductDeviceCompatibilityRepository extends TenantRepository {
  constructor(db: Database, tenantId: string) {
    super(db, tenantId);
  }

  /**
   * Get all compatibility mappings for the current tenant
   */
  async findAll(): Promise<ProductDeviceCompatibility[]> {
    return this.db
      .select()
      .from(productDeviceCompatibility)
      .where(eq(productDeviceCompatibility.tenantId, this.tenantId));
  }

  /**
   * Get a single compatibility mapping by ID
   */
  async findOne(id: string): Promise<ProductDeviceCompatibility | null> {
    const [result] = await this.db
      .select()
      .from(productDeviceCompatibility)
      .where(
        and(
          eq(productDeviceCompatibility.id, id),
          eq(productDeviceCompatibility.tenantId, this.tenantId)
        )
      );
    return result || null;
  }

  /**
   * Find a compatibility mapping by productId and deviceId for the current tenant
   */
  async findByProductAndDevice(productId: string, deviceId: string): Promise<ProductDeviceCompatibility | null> {
    const [result] = await this.db
      .select()
      .from(productDeviceCompatibility)
      .where(
        and(
          eq(productDeviceCompatibility.productId, productId),
          eq(productDeviceCompatibility.deviceId, deviceId),
          eq(productDeviceCompatibility.tenantId, this.tenantId)
        )
      );
    return result || null;
  }

  /**
   * Create a new compatibility mapping
   */
  async create(data: CreateProductDeviceCompatibilityInput): Promise<ProductDeviceCompatibility> {
    const [result] = await this.db
      .insert(productDeviceCompatibility)
      .values({
        ...data,
        tenantId: this.tenantId,
      })
      .returning();
    return result;
  }

  /**
   * Update an existing compatibility mapping
   */
  async update(id: string, data: UpdateProductDeviceCompatibilityInput): Promise<ProductDeviceCompatibility | null> {
    const [result] = await this.db
      .update(productDeviceCompatibility)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(productDeviceCompatibility.id, id),
          eq(productDeviceCompatibility.tenantId, this.tenantId)
        )
      )
      .returning();
    return result || null;
  }

  /**
   * Delete a compatibility mapping
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(productDeviceCompatibility)
      .where(
        and(
          eq(productDeviceCompatibility.id, id),
          eq(productDeviceCompatibility.tenantId, this.tenantId)
        )
      )
      .returning();
    return result.length > 0;
  }
}
