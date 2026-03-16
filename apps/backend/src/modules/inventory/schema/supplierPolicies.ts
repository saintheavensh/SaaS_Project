import { pgTable, uuid, integer, index } from 'drizzle-orm/pg-core';
import { tenants } from '@my-saas-app/db';
import { timestamps } from './categories.js';
import { suppliers } from './suppliers.js';

export const supplierPolicies = pgTable('supplier_policies', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    supplierId: uuid('supplier_id').references(() => suppliers.id).notNull(),
    warrantyMonths: integer('warranty_months').default(0).notNull(),
    returnWindowDays: integer('return_window_days').default(0).notNull(),
    paymentTermDays: integer('payment_term_days').default(0).notNull(),
    ...timestamps(),
}, (table) => ({
    tenantIdx: index('supplier_policies_tenant_idx').on(table.tenantId),
    supplierIdx: index('supplier_policies_supplier_idx').on(table.supplierId),
}));
