import { pgTable, uuid, varchar, text, index } from 'drizzle-orm/pg-core';
import { tenants } from './core/tenants';
import { timestamps } from './core/timestamps';

/**
 * Categories table - Master data for product categorization
 */
export const categories = pgTable('categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('categories_tenant_idx').on(table.tenantId),
        tenantNameIdx: index('categories_tenant_name_idx').on(table.tenantId, table.name),
    };
});
