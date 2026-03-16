import { pgTable, uuid, varchar, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from '../core/tenants.js';
import { timestamps } from '../core/timestamps.js';

/**
 * Products table - Scoped by tenant_id
 */
export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    stock: integer('stock').default(0).notNull(), // Snapshot stock
    categoryId: uuid('category_id'),
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('products_tenant_idx').on(table.tenantId),
        nameTenantIdx: index('products_name_tenant_idx').on(table.tenantId, table.name),
    };
});
