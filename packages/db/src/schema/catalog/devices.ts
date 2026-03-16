import { pgTable, text, jsonb, index, uuid } from 'drizzle-orm/pg-core';
import { tenants } from '../core/tenants';
import { timestamps } from '../core/timestamps';
import { deviceBrands } from '../device_brands';

/**
 * Devices table - Device Catalog for compatibility mapping
 */
export const devices = pgTable('devices', {
    id: uuid('id').defaultRandom().primaryKey(),
    brandId: uuid('device_brand_id').references(() => deviceBrands.id).notNull(),
    series: text('series'),
    model: text('model').notNull(),
    code: text('code'),
    image: text('image'),
    colors: jsonb('colors').$type<string[]>(),
    specs: text('specs'),
    chipset: text('chipset'),
    specifications: jsonb('specifications').$type<Record<string, any>>(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('devices_tenant_idx').on(table.tenantId),
        searchIdx: index('devices_tenant_brand_id_model_idx').on(table.tenantId, table.brandId, table.model),
    };
});
