import { pgTable, uuid, numeric, integer, index } from 'drizzle-orm/pg-core';
import { tenants } from '../core/tenants';
import { products } from '../catalog/products';
import { timestamps } from '../core/timestamps';

/**
 * Product Batches table - Scoped by tenant_id
 */
export const batches = pgTable('batches', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    buyPrice: numeric('buy_price').notNull(),
    sellPrice: numeric('sell_price').notNull(),
    initialStock: integer('initial_stock').notNull(),
    currentStock: integer('current_stock').notNull(),
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('batches_tenant_idx').on(table.tenantId),
        productTenantIdx: index('batches_product_tenant_idx').on(table.tenantId, table.productId),
    };
});
