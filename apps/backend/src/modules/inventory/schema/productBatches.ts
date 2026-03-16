import { pgTable, uuid, integer, numeric, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from '@my-saas-app/db';
import { timestamps } from './categories.js';
import { products } from './products.js';
import { suppliers } from './suppliers.js';

export const productBatches = pgTable('product_batches', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    supplierId: uuid('supplier_id').references(() => suppliers.id),
    buyPrice: numeric('buy_price').default('0').notNull(),
    totalQty: integer('total_qty').notNull(),
    remainingQty: integer('remaining_qty').notNull(),
    receivedAt: timestamp('received_at').defaultNow().notNull(),
    ...timestamps(),
}, (table) => ({
    tenantIdx: index('product_batches_tenant_idx').on(table.tenantId),
    productIdx: index('product_batches_product_idx').on(table.productId),
    supplierIdx: index('product_batches_supplier_idx').on(table.supplierId),
}));
