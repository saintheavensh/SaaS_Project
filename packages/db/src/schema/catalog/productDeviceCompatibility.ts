import { pgTable, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { products } from './products';
import { devices } from './devices';
import { tenants } from '../core/tenants';
import { timestamps } from '../core/timestamps';

/**
 * Product Device Compatibility table - Many-to-Many mapping
 * allows one spare part to be compatible with multiple devices.
 */
export const productDeviceCompatibility = pgTable('product_device_compatibility', {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    deviceId: uuid('device_id').references(() => devices.id).notNull(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    ...timestamps(),
}, (table) => {
    return {
        productIdx: index('pd_comp_product_idx').on(table.productId),
        deviceIdx: index('pd_comp_device_idx').on(table.deviceId),
        tenantIdx: index('pd_comp_tenant_idx').on(table.tenantId),
        uniqueProductDevice: uniqueIndex('pd_comp_unique_product_device').on(table.productId, table.deviceId),
    };
});
