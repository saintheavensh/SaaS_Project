import { pgTable, uuid, varchar, index } from 'drizzle-orm/pg-core';
import { tenants } from './core/tenants';
import { timestamps } from './core/timestamps';

/**
 * Device Brands table - Master data for device brands (e.g., Apple, Samsung, Oppo)
 */
export const deviceBrands = pgTable('device_brands', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('device_brands_tenant_idx').on(table.tenantId),
        tenantNameIdx: index('device_brands_tenant_name_idx').on(table.tenantId, table.name),
    };
});
