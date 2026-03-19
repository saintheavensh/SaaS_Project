import { eq, and } from 'drizzle-orm';
import { Database, TenantRepository } from '../../../core/database/tenant-repository-base.js';
import { discounts } from '@my-saas-app/db';

/**
 * Repository for Discount operations
 */
export class DiscountRepository extends TenantRepository {
    constructor(db: Database, tenantId: string) {
        super(db, tenantId);
    }

    /**
     * Get active discounts for a tenant, optionally filtered by customer
     */
    async getActiveDiscounts(customerId?: string | null): Promise<any[]> {
        const filters = [
            eq(discounts.tenantId, this.tenantId),
            eq(discounts.active, true),
        ];

        if (customerId) {
            filters.push(eq(discounts.customerId, customerId));
        } else {
            // If no customerId provided, we might want to fetch "General" discounts
            // (logic: customerId is null)
            // filters.push(isNull(discounts.customerId)); 
        }

        return this.db
            .select()
            .from(discounts)
            .where(and(...filters));
    }
}
