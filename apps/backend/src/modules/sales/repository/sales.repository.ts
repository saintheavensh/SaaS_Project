import { Database, TenantRepository } from '../../../core/database/tenant-repository-base.js';
import { sales, salesItems, salesItemBatches } from '@my-saas-app/db';
import { SaleStatus } from '../types/sales.types.js';

/**
 * Repository for Sales operations, enforcing tenant isolation.
 */
export class SalesRepository extends TenantRepository {
    constructor(db: Database, tenantId: string) {
        super(db, tenantId);
    }

    /**
     * Create a new sale record
     */
    async createSale(
        data: {
            customerId?: string | null;
            totalAmount: number;
            revenue: number;
            cogs: number;
            grossProfit: number;
            status: SaleStatus;
        },
        tx?: Database
    ) {
        const client = tx || this.db;

        const [newSale] = await client
            .insert(sales)
            .values({
                tenantId: this.tenantId,
                customerId: data.customerId ?? null,
                totalAmount: data.totalAmount.toString(),
                revenue: data.revenue.toString(),
                cogs: data.cogs.toString(),
                grossProfit: data.grossProfit.toString(),
                status: data.status,
            })
            .returning();

        return newSale;
    }

    /**
     * Create a new sale item record
     */
    async createSaleItem(
        data: {
            saleId: string;
            productId: string;
            quantity: number;
            sellPrice: number;
        },
        tx?: Database
    ) {
        const client = tx || this.db;

        const [newItem] = await client
            .insert(salesItems)
            .values({
                tenantId: this.tenantId,
                saleId: data.saleId,
                productId: data.productId,
                quantity: data.quantity,
                sellPrice: data.sellPrice.toString(),
            })
            .returning();

        return newItem;
    }

    /**
     * Create a new sales item batch record to store FIFO consumption
     */
    async createSaleItemBatch(
        data: {
            saleItemId: string;
            batchId: string;
            quantity: number;
            sellPrice: number;
            buyPrice: string;
        },
        tx?: Database
    ) {
        const client = tx || this.db;

        const [newSaleItemBatch] = await client
            .insert(salesItemBatches)
            .values({
                tenantId: this.tenantId,
                saleItemId: data.saleItemId,
                batchId: data.batchId,
                quantity: data.quantity,
                sellPrice: data.sellPrice.toString(),
                buyPrice: data.buyPrice,
            })
            .returning();

        return newSaleItemBatch;
    }
}
