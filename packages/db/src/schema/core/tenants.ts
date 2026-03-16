import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';

/**
 * Tenants table - Root of multi-tenancy
 */
export const tenants = pgTable('tenants', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
