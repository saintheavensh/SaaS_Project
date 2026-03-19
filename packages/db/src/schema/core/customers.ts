import { pgTable, uuid, text, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { timestamps } from './timestamps';

/**
 * Customers table - Scoped by tenant_id
 */
export const customers = pgTable('customers', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
        .references(() => tenants.id)
        .notNull(),
    name: text('name').notNull(),
    customerType: text('customer_type'), // e.g., 'RETAIL', 'WHOLESALE'
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('customers_tenant_idx').on(table.tenantId),
    };
});
