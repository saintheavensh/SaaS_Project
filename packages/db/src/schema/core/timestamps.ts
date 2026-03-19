import { timestamp } from "drizzle-orm/pg-core";

/**
 * Shared timestamps helper for schema consistency.
 * Returns createdAt and updatedAt columns.
 */
export const timestamps = () => ({
  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});