import { PgColumn } from 'drizzle-orm/pg-core';
import { SQL, eq } from 'drizzle-orm';

/**
 * Interface representing instances of Drizzle DB connections
 */
export type Database = any; // You can refine this using Drizzle's NodePgDatabase type if strongly typed throughout project

/**
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
