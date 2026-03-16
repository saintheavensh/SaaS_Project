import { eq, and } from 'drizzle-orm';
import { Database, TenantRepository } from '../../core/database/tenant-repository-base.js';
import { deviceBrands } from '@my-saas-app/db';
import { DeviceBrand, CreateDeviceBrandInput, UpdateDeviceBrandInput } from './types.js';

/**
 * Repository for Device Brand operations
 */
export class DeviceBrandRepository extends TenantRepository {
  constructor(db: Database, tenantId: string) {
    super(db, tenantId);
  }

  /**
   * Get all device brands for the current tenant
   */
  async getDeviceBrands(): Promise<DeviceBrand[]> {
    return this.db
      .select()
      .from(deviceBrands)
      .where(eq(deviceBrands.tenantId, this.tenantId));
  }

  /**
   * Get a single device brand by ID
   */
  async getDeviceBrandById(id: string): Promise<DeviceBrand | null> {
    const [result] = await this.db
      .select()
      .from(deviceBrands)
      .where(
        and(
          eq(deviceBrands.id, id),
          eq(deviceBrands.tenantId, this.tenantId)
        )
      );
    return result || null;
  }

  /**
   * Create a new device brand
   */
  async createDeviceBrand(data: CreateDeviceBrandInput): Promise<DeviceBrand> {
    const [result] = await this.db
      .insert(deviceBrands)
      .values({
        ...data,
        tenantId: this.tenantId,
      })
      .returning();
    return result;
  }

  /**
   * Update an existing device brand
   */
  async updateDeviceBrand(id: string, data: UpdateDeviceBrandInput): Promise<DeviceBrand | null> {
    const [result] = await this.db
      .update(deviceBrands)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(deviceBrands.id, id),
          eq(deviceBrands.tenantId, this.tenantId)
        )
      )
      .returning();
    return result || null;
  }

  /**
   * Delete a device brand
   */
  async deleteDeviceBrand(id: string): Promise<boolean> {
    const result = await this.db
      .delete(deviceBrands)
      .where(
        and(
          eq(deviceBrands.id, id),
          eq(deviceBrands.tenantId, this.tenantId)
        )
      )
      .returning();
    return result.length > 0;
  }
}
