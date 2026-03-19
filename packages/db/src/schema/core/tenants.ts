import { pgTable, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { timestamps } from './timestamps';

/**
 * Tenants table - Root of multi-tenancy
 */
export const tenants = pgTable('tenants', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    ...timestamps(),
});
