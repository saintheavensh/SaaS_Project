import { pgTable, uuid, numeric, index } from 'drizzle-orm/pg-core';
import { tenants } from '@my-saas-app/db';
import { timestamps } from './categories.js';
import { suppliers } from './suppliers.js';
import { products } from './products.js';

export const supplierProducts = pgTable('supplier_products', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    supplierId: uuid('supplier_id').references(() => suppliers.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    lastBuyPrice: numeric('last_buy_price').default('0').notNull(),
    ...timestamps(),
}, (table) => ({
    tenantIdx: index('supplier_products_tenant_idx').on(table.tenantId),
    supplierIdx: index('supplier_products_supplier_idx').on(table.supplierId),
    productIdx: index('supplier_products_product_idx').on(table.productId),
}));
