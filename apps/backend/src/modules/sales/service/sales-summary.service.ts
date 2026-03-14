import { SalesSummaryRepository } from '../repository/sales-summary.repository.js';
import { db } from '../../../core/db.js';

/**
 * Service for Sales Summary operations.
 * Coordinates metric calculation and synchronization.
 */
export class SalesSummaryService {
    constructor(
        private readonly tenantId: string,
        private readonly repository: SalesSummaryRepository
    ) {}

    /**
     * Synchronize a summary entry for a specific date.
     * Calculates live data and upserts it into the cached summary table.
     */
    async syncDailySummary(date: Date) {
        // Normalize date to start of day
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        await db.transaction(async (tx) => {
            // 1. Calculate live metrics from raw tables
            const metrics = await this.repository.calculateMetrics(startDate, endDate, tx);

            // 2. Upsert into cached summary table
            await this.repository.upsertDailySummary({
                entryDate: startDate,
                ...metrics,
            }, tx);
        });

        return { success: true, date: startDate };
    }

    /**
     * Get summary metrics for a date range (reads from cache).
     * Falls back to live calculation if needed (optional implementation).
     */
    async getSummary(startDate: Date, endDate: Date) {
        // For now, this just calls the calculateMetrics for immediate live data
        // In a production environment, this would read from simple SELECT on sales_summaries
        return this.repository.calculateMetrics(startDate, endDate);
    }

    /**
     * Get product-level performance stats.
     */
    async getProductPerformance(startDate: Date, endDate: Date) {
        return this.repository.getProductSalesStats(startDate, endDate);
    }
}
