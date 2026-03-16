import { pgTable, uuid, varchar, text, json, index } from 'drizzle-orm/pg-core';
import { tenants } from '@my-saas-app/db';
import { timestamps } from './categories.js';

export const devices = pgTable('devices', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    brand: varchar('brand', { length: 255 }).notNull(),
    series: varchar('series', { length: 255 }),
    model: varchar('model', { length: 255 }).notNull(),
    code: varchar('code', { length: 100 }),
    image: text('image'),
    colors: json('colors').$type<string[]>(),
    chipset: varchar('chipset', { length: 255 }),
    specs: text('specs'),
    specifications: json('specifications').$type<Record<string, any>>(),
    ...timestamps(),
}, (table) => ({
    tenantIdx: index('devices_tenant_idx').on(table.tenantId),
}));
