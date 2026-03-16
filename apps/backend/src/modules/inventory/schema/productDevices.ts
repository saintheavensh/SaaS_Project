import { pgTable, uuid, index } from 'drizzle-orm/pg-core';
import { tenants } from '@my-saas-app/db';
import { timestamps } from './categories.js';
import { products } from './products.js';
import { devices } from './devices.js';

export const productDevices = pgTable('product_devices', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    deviceId: uuid('device_id').references(() => devices.id).notNull(),
    ...timestamps(),
}, (table) => ({
    tenantIdx: index('product_devices_tenant_idx').on(table.tenantId),
    productIdx: index('product_devices_product_idx').on(table.productId),
    deviceIdx: index('product_devices_device_idx').on(table.deviceId),
}));
