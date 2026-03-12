import { PgColumn } from 'drizzle-orm/pg-core';
import { SQL, eq } from 'drizzle-orm';
import { db } from '../db.js';

/**
 * Interface representing instances of Drizzle DB connections
 */
export type Database = typeof db;

/**
 * ARCHITECTURE GUARD (STRICT):
 * 1. Repositories are the ONLY place allowed to access the database.
 * 2. Services must NEVER import `db` directly.
 * 3. Tenant filtering MUST be enforced at the repository layer.
 * 
 * Base abstract class for repositories representing tenant-isolated database access.
 * Enforces that a tenantId is always provided when constructing a repository instance.
 */
export abstract class TenantRepository {
    constructor(
        protected readonly db: Database,
        protected readonly tenantId: string
    ) {
        if (!tenantId) {
            throw new Error(`TenantRepository initialization failed: tenantId is required.`);
        }
    }

    /**
     * Generates a standard WHERE clause for this tenant.
     * @param tenantIdColumn The specific Drizzle column representing tenantId in the table being queried.
     */
    protected tenantWhere(tenantIdColumn: PgColumn): SQL {
        return eq(tenantIdColumn, this.tenantId);
    }
}
