import { pgTable, uuid, text, integer, index } from 'drizzle-orm/pg-core';
import { tenants } from '../core/tenants';
import { products } from '../catalog/products';
import { batches } from './batches';
import { timestamps } from '../core/timestamps';

/**
 * Stock Movements table - Append-only ledger scoped by tenant_id
 */
export const stockMovements = pgTable('stock_movements', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    batchId: uuid('batch_id').references(() => batches.id).notNull(),
    movementType: text('movement_type').notNull(), // e.g., PURCHASE, SALE, ADJUSTMENT, OPNAME
    delta: integer('delta').notNull(), // positive = added, negative = removed
    referenceId: uuid('reference_id'),
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('stock_movements_tenant_idx').on(table.tenantId),
        productIdx: index('stock_movements_product_idx').on(table.productId),
        batchIdx: index('stock_movements_batch_idx').on(table.batchId),
        createdAtIdx: index('stock_movements_created_at_idx').on(table.createdAt),
    };
});
