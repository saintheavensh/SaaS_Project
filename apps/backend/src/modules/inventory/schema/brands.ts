import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from '@my-saas-app/db';
import { timestamps } from './categories.js';

export const brands = pgTable('brands', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    ...timestamps(),
}, (table) => ({
    tenantIdx: index('brands_tenant_idx').on(table.tenantId),
}));
