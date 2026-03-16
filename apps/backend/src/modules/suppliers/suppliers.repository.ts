import { eq, and } from 'drizzle-orm';
import { Database, TenantRepository } from '../../core/database/tenant-repository-base.js';
import { suppliers } from '@my-saas-app/db';
import { Supplier, CreateSupplierInput, UpdateSupplierInput } from './types.js';

/**
 * Repository for Supplier operations
 */
export class SupplierRepository extends TenantRepository {
  constructor(db: Database, tenantId: string) {
    super(db, tenantId);
  }

  /**
   * Get all suppliers for the current tenant
   */
  async getSuppliers(): Promise<Supplier[]> {
    return this.db
      .select()
      .from(suppliers)
      .where(eq(suppliers.tenantId, this.tenantId));
  }

  /**
   * Get a single supplier by ID
   */
  async getSupplierById(id: string): Promise<Supplier | null> {
    const [result] = await this.db
      .select()
      .from(suppliers)
      .where(
        and(
          eq(suppliers.id, id),
          eq(suppliers.tenantId, this.tenantId)
        )
      );
    return result || null;
  }

  /**
   * Create a new supplier
   */
  async createSupplier(data: CreateSupplierInput): Promise<Supplier> {
    const [result] = await this.db
      .insert(suppliers)
      .values({
        ...data,
        tenantId: this.tenantId,
      })
      .returning();
    return result;
  }

  /**
   * Update an existing supplier
   */
  async updateSupplier(id: string, data: UpdateSupplierInput): Promise<Supplier | null> {
    const [result] = await this.db
      .update(suppliers)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(suppliers.id, id),
          eq(suppliers.tenantId, this.tenantId)
        )
      )
      .returning();
    return result || null;
  }

  /**
   * Delete a supplier
   */
  async deleteSupplier(id: string): Promise<boolean> {
    const result = await this.db
      .delete(suppliers)
      .where(
        and(
          eq(suppliers.id, id),
          eq(suppliers.tenantId, this.tenantId)
        )
      )
      .returning();
    return result.length > 0;
  }
}
