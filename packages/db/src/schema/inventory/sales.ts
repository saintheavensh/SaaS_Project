import { pgTable, uuid, numeric, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from '../core/tenants';
import { products } from '../catalog/products';
import { customers } from '../core/customers';
import { batches } from './batches';
import { timestamps } from '../core/timestamps';

export const sales = pgTable('sales', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    customerId: uuid('customer_id').references(() => customers.id),
    totalAmount: numeric('total_amount').notNull(), // Final amount paid
    originalAmount: numeric('original_amount').notNull(), // Before discounts
    discountAmount: numeric('discount_amount').default('0').notNull(),
    revenue: numeric('revenue').notNull(),
    cogs: numeric('cogs').notNull(),
    grossProfit: numeric('gross_profit').notNull(),
    status: text('status').notNull(),
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('sales_tenant_idx').on(table.tenantId),
    };
});

export const salesItems = pgTable('sales_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    saleId: uuid('sale_id').references(() => sales.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    quantity: integer('quantity').notNull(),
    sellPrice: numeric('sell_price').notNull(), // Final sell price per unit
    originalPrice: numeric('original_price').notNull(), // Original price per unit
    discountAmount: numeric('discount_amount').default('0').notNull(), // Total discount for this line item
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('sales_items_tenant_idx').on(table.tenantId),
        saleIdx: index('sales_items_sale_idx').on(table.saleId),
        productIdx: index('sales_items_product_idx').on(table.productId),
    };
});

export const salesItemBatches = pgTable('sales_item_batches', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    saleItemId: uuid('sale_item_id').references(() => salesItems.id).notNull(),
    batchId: uuid('batch_id').references(() => batches.id).notNull(),
    quantity: integer('quantity').notNull(),
    costPrice: numeric('cost_price').notNull(),
    sellPrice: numeric('sell_price').notNull(),
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('sales_item_batches_tenant_idx').on(table.tenantId),
        saleItemIdx: index('sales_item_batches_sale_item_idx').on(table.saleItemId),
        batchIdx: index('sales_item_batches_batch_idx').on(table.batchId),
    };
});

export const salesSummaries = pgTable('sales_summaries', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    entryDate: timestamp('entry_date').notNull(), // Daily entry
    totalRevenue: numeric('total_revenue').default('0').notNull(),
    totalCogs: numeric('total_cogs').default('0').notNull(),
    totalGrossProfit: numeric('total_gross_profit').default('0').notNull(),
    salesCount: integer('sales_count').default(0).notNull(),
    ...timestamps(),
}, (table) => {
    return {
        tenantDateIdx: index('sales_summary_tenant_date_idx').on(table.tenantId, table.entryDate),
    };
});
