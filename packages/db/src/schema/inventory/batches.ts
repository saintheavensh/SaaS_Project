import { pgTable, uuid, numeric, integer, index, check } from 'drizzle-orm/pg-core';
import { tenants } from '../core/tenants';
import { products } from '../catalog/products';
import { timestamps } from '../core/timestamps';
import { sql } from 'drizzle-orm';

// 🔥 tambahkan ini
import { suppliers } from '../suppliers';

/**
 * Product Batches table - Scoped by tenant_id
 */
export const batches = pgTable('batches', {
    id: uuid('id').defaultRandom().primaryKey(),

    tenantId: uuid('tenant_id')
        .references(() => tenants.id)
        .notNull(),

    productId: uuid('product_id')
        .references(() => products.id)
        .notNull(),

    // ✅ FIX: supplier FK
    supplierId: uuid('supplier_id')
        .references(() => suppliers.id)
        .notNull(),

    buyPrice: numeric('buy_price').notNull(),
    sellPrice: numeric('sell_price').notNull(),

    initialStock: integer('initial_stock').notNull(),
    currentStock: integer('current_stock').notNull(),

    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('batches_tenant_idx').on(table.tenantId),
        productIdx: index('batches_product_idx').on(table.productId),
        supplierIdx: index('batches_supplier_idx').on(table.supplierId),
        currentStockCheck: check('batches_current_stock_check', sql`${table.currentStock} >= 0`),
    };
});