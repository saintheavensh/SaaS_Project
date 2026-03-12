import { SQL, eq, and } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';

/**
 * ARCHITECTURE GUARD (STRICT):
 * 1. Repositories are the ONLY place allowed to access the database.
 * 2. Services must NEVER import `db` directly.
 * 3. Tenant filtering MUST be enforced at the repository layer.
 * 
 * Generates an SQL where clause for tenant filtering.
 * Enforces that a query is scoped to a specific tenant ID.
 *
 * @param tenantIdColumn - The Drizzle Column representing the tenant ID in the table
 * @param tenantId - The active tenant ID from the request context
 * @returns An SQL equality condition for scoped queries
 */
export function tenantWhere(tenantIdColumn: PgColumn, tenantId: string): SQL {
    if (!tenantId) {
        throw new Error("A valid tenantId is required for repository queries.");
    }
    return eq(tenantIdColumn, tenantId);
}
