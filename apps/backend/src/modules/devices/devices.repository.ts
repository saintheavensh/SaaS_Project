import { eq, and } from 'drizzle-orm';
import { Database, TenantRepository } from '../../core/database/tenant-repository-base.js';
import { devices } from '@my-saas-app/db';
import { Device, CreateDeviceInput, UpdateDeviceInput } from './types.js';

/**
 * Repository for Device operations
 */
export class DevicesRepository extends TenantRepository {
  constructor(db: Database, tenantId: string) {
    super(db, tenantId);
  }

  /**
   * Get all devices for the current tenant
   */
  async findAll(): Promise<Device[]> {
    return this.db
      .select()
      .from(devices)
      .where(eq(devices.tenantId, this.tenantId));
  }

  /**
   * Get a single device by ID
   */
  async findOne(id: string): Promise<Device | null> {
    const [result] = await this.db
      .select()
      .from(devices)
      .where(
        and(
          eq(devices.id, id),
          eq(devices.tenantId, this.tenantId)
        )
      );
    return result || null;
  }

  /**
   * Create a new device
   */
  async create(data: CreateDeviceInput): Promise<Device> {
    const [result] = await this.db
      .insert(devices)
      .values({
        ...data,
        tenantId: this.tenantId,
      })
      .returning();
    return result;
  }

  /**
   * Update an existing device
   */
  async update(id: string, data: UpdateDeviceInput): Promise<Device | null> {
    const [result] = await this.db
      .update(devices)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(devices.id, id),
          eq(devices.tenantId, this.tenantId)
        )
      )
      .returning();
    return result || null;
  }

  /**
   * Find a device by brand and model for the current tenant
   */
  async findByBrandAndModel(brand: string, model: string): Promise<Device | null> {
    const [result] = await this.db
      .select()
      .from(devices)
      .where(
        and(
          eq(devices.brand, brand),
          eq(devices.model, model),
          eq(devices.tenantId, this.tenantId)
        )
      );
    return result || null;
  }

  /**
   * Delete a device
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(devices)
      .where(
        and(
          eq(devices.id, id),
          eq(devices.tenantId, this.tenantId)
        )
      )
      .returning();
    return result.length > 0;
  }
}
