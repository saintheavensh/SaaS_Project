import { pgTable, uuid, text, boolean, decimal, index } from 'drizzle-orm/pg-core';
import { tenants } from '../core/tenants';
import { customers } from '../core/customers';
import { timestamps } from '../core/timestamps';

/**
 * Discounts table - Scoped by tenant_id
 */
export const discounts = pgTable('discounts', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
        .references(() => tenants.id)
        .notNull(),
    customerId: uuid('customer_id')
        .references(() => customers.id), // If null, applies to all (optional future logic)
    discountType: text('discount_type').notNull(), // e.g., 'PERCENTAGE', 'FIXED'
    value: decimal('value', { precision: 12, scale: 2 }).notNull(),
    active: boolean('active').default(true).notNull(),
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('discounts_tenant_idx').on(table.tenantId),
        customerIdx: index('discounts_customer_idx').on(table.customerId),
    };
});
