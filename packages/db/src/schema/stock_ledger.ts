import { pgTable, uuid, integer, text, index } from 'drizzle-orm/pg-core';
import { tenants } from './core/tenants';
import { products } from './catalog/products';
import { batches } from './inventory/batches';
import { timestamps } from './core/timestamps';

/**
 * Stock Ledger table - Tracks all stock movements (FIFO step 1)
 */
export const stockLedger = pgTable('stock_ledger', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    batchId: uuid('batch_id').references(() => batches.id), // Nullable as per spec
    type: text('type').$type<'IN' | 'OUT' | 'ADJUSTMENT'>().notNull(),
    quantity: integer('quantity').notNull(), // positive = IN, negative = OUT
    reference: text('reference'), // Nullable text for linking
    ...timestamps(),
}, (table) => ({
    tenantIdx: index('stock_ledger_tenant_idx').on(table.tenantId),
    productIdx: index('stock_ledger_product_idx').on(table.productId),
    batchIdx: index('stock_ledger_batch_idx').on(table.batchId),
}));