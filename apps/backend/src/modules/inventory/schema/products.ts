import { pgTable, uuid, varchar, timestamp, text, index, boolean } from 'drizzle-orm/pg-core';
import { tenants } from '@my-saas-app/db';
import { timestamps } from './categories.js';
import { categories } from './categories.js';

export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    categoryId: uuid('category_id').references(() => categories.id),
    description: text('description'),
    image: text('image'),
    allowBelowCost: boolean('allow_below_cost').default(false).notNull(),
    ...timestamps(),
}, (table) => ({
    tenantIdx: index('products_tenant_idx').on(table.tenantId),
    categoryIdx: index('products_category_idx').on(table.categoryId),
}));
