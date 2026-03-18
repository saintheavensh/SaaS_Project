import { pgTable, uuid, integer, text, index } from 'drizzle-orm/pg-core';
import { tenants } from './core/tenants';
import { timestamps } from './core/timestamps.js';
import { products } from './catalog/products';
import { batches } from './inventory/batches';

export const stockLedger = pgTable('stock_ledger', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    batchId: uuid('batch_id').references(() => batches.id).notNull(),
    movementType: text('movement_type').$type<'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN'>().notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: integer('unit_price').notNull(),        // harga per unit (minor unit)
    buyPrice: integer('buy_price').notNull(),          // harga beli (minor unit)
    referenceType: text('reference_type').$type<'SALE' | 'PURCHASE' | 'SERVICE' | 'RETURN'>().notNull(),
    referenceId: uuid('reference_id'),
    ...timestamps(),
}, (table) => ({
    tenantIdx: index('stock_ledger_tenant_idx').on(table.tenantId),
    productIdx: index('stock_ledger_product_idx').on(table.productId),
    batchIdx: index('stock_ledger_batch_idx').on(table.batchId),
}));