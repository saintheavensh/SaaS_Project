import { pgTable, uuid, varchar, text, index } from 'drizzle-orm/pg-core';
import { tenants } from '../core/tenants';
import { timestamps } from '../core/timestamps';

// 🔥 tambahkan import ini
import { categories } from '../categories';
import { productBrands } from '../product_brands';
import { productTypes } from '../product_types';

/**
 * Products table - Scoped by tenant_id
 */
export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),

    tenantId: uuid('tenant_id')
        .references(() => tenants.id)
        .notNull(),

    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),

    // ✅ FIX 1: category FK
    categoryId: uuid('category_id')
        .references(() => categories.id)
        .notNull(),

    // ✅ FIX 2: product brand FK
    productBrandId: uuid('product_brand_id')
        .references(() => productBrands.id)
        .notNull(),

    // ✅ FIX 3: product type FK
    productTypeId: uuid('product_type_id')
        .references(() => productTypes.id)
        .notNull(),

    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('products_tenant_idx').on(table.tenantId),
        nameTenantIdx: index('products_name_tenant_idx').on(table.tenantId, table.name),
        categoryIdx: index('products_category_idx').on(table.categoryId),
    };
});