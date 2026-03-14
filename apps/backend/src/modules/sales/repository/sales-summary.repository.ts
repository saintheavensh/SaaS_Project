import { eq, and, sql, sum, count, gte, lte } from 'drizzle-orm';
import { sales, salesItems, salesItemBatches, salesSummaries } from '@my-saas-app/db';
import { TenantRepository, Database } from '../../../core/database/tenant-repository-base.js';
import { safeSubtract } from '../../../core/utils/currency.js';

/**
 * Repository for Sales Summary aggregations and cached metrics.
 */
export class SalesSummaryRepository extends TenantRepository {
    constructor(db: Database, tenantId: string) {
        super(db, tenantId);
    }

    /**
     * Upsert a daily summary entry.
     */
    async upsertDailySummary(data: {
        entryDate: Date;
        totalRevenue: string;
        totalCogs: string;
        totalGrossProfit: string;
        salesCount: number;
    }, tx?: Database) {
        const client = tx || this.db;
        
        return client
            .insert(salesSummaries)
            .values({
                tenantId: this.tenantId,
                ...data,
            })
            .onConflictDoUpdate({
                target: [salesSummaries.tenantId, salesSummaries.entryDate],
                set: {
                    totalRevenue: data.totalRevenue,
                    totalCogs: data.totalCogs,
                    totalGrossProfit: data.totalGrossProfit,
                    salesCount: data.salesCount,
                    updatedAt: new Date(),
                }
            })
            .returning();
    }

    /**
     * Aggregate metrics for a specific date range.
     * Note: This hits the raw tables (sales, item_batches) for live calculation.
     */
    async calculateMetrics(startDate: Date, endDate: Date, tx?: Database) {
        const client = tx || this.db;

        // 1. Calculate Revenue & Sales Count
        const revenueResult = await client
            .select({
                totalRevenue: sum(sales.totalAmount),
                salesCount: count(sales.id),
            })
            .from(sales)
            .where(
                and(
                    eq(sales.tenantId, this.tenantId),
                    gte(sales.createdAt, startDate),
                    lte(sales.createdAt, endDate)
                )
            );

        // 2. Calculate COGS (from sales_item_batches)
        const cogsResult = await client
            .select({
                totalCogs: sum(sql`${salesItemBatches.quantity} * ${salesItemBatches.buyPrice}`),
            })
            .from(salesItemBatches)
            .where(
                and(
                    eq(salesItemBatches.tenantId, this.tenantId),
                    gte(salesItemBatches.createdAt, startDate),
                    lte(salesItemBatches.createdAt, endDate)
                )
            );

        const revenue = revenueResult[0]?.totalRevenue || '0';
        const cogs = cogsResult[0]?.totalCogs || '0';
        const salesCount = revenueResult[0]?.salesCount || 0;
        const grossProfit = safeSubtract(revenue, cogs);

        return {
            totalRevenue: revenue,
            totalCogs: cogs,
            totalGrossProfit: grossProfit,
            salesCount,
        };
    }

    /**
     * Aggregate sales count per product for a date range.
     */
    async getProductSalesStats(startDate: Date, endDate: Date) {
        return this.db
            .select({
                productId: salesItems.productId,
                quantitySold: sum(salesItems.quantity),
                totalRevenue: sum(sql`${salesItems.quantity} * ${salesItems.sellPrice}`),
            })
            .from(salesItems)
            .where(
                and(
                    eq(salesItems.tenantId, this.tenantId),
                    gte(salesItems.createdAt, startDate),
                    lte(salesItems.createdAt, endDate)
                )
            )
            .groupBy(salesItems.productId);
    }
}
