import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from '@my-saas-app/db';

export const timestamps = () => ({
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    ...timestamps(),
}, (table) => ({
    tenantIdx: index('categories_tenant_idx').on(table.tenantId),
}));
