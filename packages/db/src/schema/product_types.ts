import { pgTable, uuid, varchar, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { tenants } from './core/tenants';
import { timestamps } from './core/timestamps';
import { categories } from './categories';

/**
 * Product Types table - Master data for specific types within a category
 * (e.g., Laptops, Smartphones within 'Consumer Electronics')
 */
export const productTypes = pgTable('product_types', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    categoryId: uuid('category_id').references(() => categories.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('product_types_tenant_idx').on(table.tenantId),
        tenantCategoryIdx: index('product_types_tenant_category_idx').on(table.tenantId, table.categoryId),
        uniqueTenantCategoryName: uniqueIndex('product_types_unique_tenant_category_name').on(table.tenantId, table.categoryId, table.name),
    };
});
