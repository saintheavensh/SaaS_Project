import { pgTable, uuid, varchar, text, index } from 'drizzle-orm/pg-core';
import { tenants } from '@my-saas-app/db';
import { timestamps } from './categories.js';

export const suppliers = pgTable('suppliers', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    address: text('address'),
    ...timestamps(),
}, (table) => ({
    tenantIdx: index('suppliers_tenant_idx').on(table.tenantId),
}));
