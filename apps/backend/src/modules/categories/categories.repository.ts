import { eq, and } from 'drizzle-orm';
import { Database, TenantRepository } from '../../core/database/tenant-repository-base.js';
import { categories } from '@my-saas-app/db';
import { Category, CreateCategoryInput, UpdateCategoryInput } from './types.js';

/**
 * Repository for Category operations
 */
export class CategoryRepository extends TenantRepository {
  constructor(db: Database, tenantId: string) {
    super(db, tenantId);
  }

  /**
   * Get all categories for the current tenant
   */
  async getCategories(): Promise<Category[]> {
    return this.db
      .select()
      .from(categories)
      .where(eq(categories.tenantId, this.tenantId));
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    const [result] = await this.db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, id),
          eq(categories.tenantId, this.tenantId)
        )
      );
    return result || null;
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryInput): Promise<Category> {
    const [result] = await this.db
      .insert(categories)
      .values({
        ...data,
        tenantId: this.tenantId,
      })
      .returning();
    return result;
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: string, data: UpdateCategoryInput): Promise<Category | null> {
    const [result] = await this.db
      .update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(categories.id, id),
          eq(categories.tenantId, this.tenantId)
        )
      )
      .returning();
    return result || null;
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<boolean> {
    const result = await this.db
      .delete(categories)
      .where(
        and(
          eq(categories.id, id),
          eq(categories.tenantId, this.tenantId)
        )
      )
      .returning();
    return result.length > 0;
  }
}
