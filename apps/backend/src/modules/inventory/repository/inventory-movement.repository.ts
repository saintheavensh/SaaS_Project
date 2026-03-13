import { eq, and, desc } from 'drizzle-orm';
import { inventoryMovements } from '@my-saas-app/db';
import { TenantRepository, Database } from '../../../core/database/tenant-repository-base.js';

/**
 * Strict movement type for inventory movements.
 */
export type MovementType = 'PURCHASE' | 'SALE' | 'ADJUSTMENT';

/**
 * Repository for Inventory Movements.
 * Append-only audit trail. Enforces tenant isolation.
 */
export class InventoryMovementRepository extends TenantRepository {
    constructor(db: Database, tenantId: string) {
        super(db, tenantId);
    }

    /**
     * Record a new inventory movement.
     * Append-only — no updates or deletes.
     */
    async createMovement(
        data: {
            productId: string;
            batchId?: string | null;
            type: MovementType;
            quantity: number;
            referenceId?: string | null;
        },
        tx?: Database
    ) {
        const client = tx || this.db;

        const [record] = await client
            .insert(inventoryMovements)
            .values({
                tenantId: this.tenantId,
                productId: data.productId,
                batchId: data.batchId ?? null,
                type: data.type,
                quantity: data.quantity,
                referenceId: data.referenceId ?? null,
            })
            .returning();

        return record;
    }

    /**
     * Find all movements for a specific product.
     */
    async findByProduct(productId: string) {
        return this.db
            .select()
            .from(inventoryMovements)
            .where(
                and(
                    this.tenantWhere(inventoryMovements.tenantId),
                    eq(inventoryMovements.productId, productId)
                )
            )
            .orderBy(desc(inventoryMovements.createdAt));
    }

    /**
     * Find all movements for a specific reference (e.g. a saleId or purchaseId).
     */
    async findByReference(referenceId: string) {
        return this.db
            .select()
            .from(inventoryMovements)
            .where(
                and(
                    this.tenantWhere(inventoryMovements.tenantId),
                    eq(inventoryMovements.referenceId, referenceId)
                )
            )
            .orderBy(desc(inventoryMovements.createdAt));
    }
}
