import { pgTable, uuid, varchar, text, index } from 'drizzle-orm/pg-core';
import { tenants } from './core/tenants';
import { timestamps } from './core/timestamps';

/**
 * Suppliers table - Master data for product suppliers
 */
export const suppliers = pgTable('suppliers', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    contactName: varchar('contact_name', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    email: varchar('email', { length: 255 }),
    address: text('address'),
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('suppliers_tenant_idx').on(table.tenantId),
        tenantNameIdx: index('suppliers_tenant_name_idx').on(table.tenantId, table.name),
    };
});
