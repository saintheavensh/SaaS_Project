import { eq, and, ilike, or, asc, sql } from 'drizzle-orm';
import { Database, TenantRepository } from '../../core/database/tenant-repository-base.js';
import { products, devices, productDeviceCompatibility } from '@my-saas-app/db';
import { CatalogDevice, CatalogProduct, CatalogDisplay, DeviceSparepartResult, DeviceSearchResult } from './types.js';

/**
 * Repository for Catalog operations, focusing on product-device compatibility and display titles.
 */
export class CatalogRepository extends TenantRepository {
    constructor(db: Database, tenantId: string) {
        super(db, tenantId);
    }

    /**
     * Public method to get aggregated catalog display data.
     */
    async getCatalogDisplay(): Promise<CatalogDisplay[]> {
        const rows = await this.fetchProductDeviceRows();
        const groupedProducts = this.groupProducts(rows);
        
        return groupedProducts.map(product => ({
            productId: product.id,
            title: this.buildCatalogTitle(product)
        }));
    }

    /**
     * Public method to search spareparts compatible with a specific device.
     */
    async searchSparepartsByDevice(deviceId: string): Promise<DeviceSparepartResult | null> {
        const rows = await this.db
            .select({
                deviceId: devices.id,
                deviceBrand: devices.brand,
                deviceModel: devices.model,
                productId: products.id,
                productName: products.name,
            })
            .from(devices)
            .leftJoin(
                productDeviceCompatibility,
                eq(productDeviceCompatibility.deviceId, devices.id)
            )
            .leftJoin(
                products,
                eq(productDeviceCompatibility.productId, products.id)
            )
            .where(
                and(
                    eq(devices.id, deviceId),
                    eq(devices.tenantId, this.tenantId)
                )
            );

        if (rows.length === 0) {
            return null;
        }

        const result: DeviceSparepartResult = {
            deviceId: rows[0].deviceId,
            deviceBrand: rows[0].deviceBrand as string,
            deviceModel: rows[0].deviceModel as string,
            products: []
        };

        for (const row of rows) {
            if (row.productId && row.productName && !result.products.some(p => p.id === row.productId)) {
                result.products.push({
                    id: row.productId,
                    name: row.productName as string
                });
            }
        }

        return result;
    }

    /**
     * Public method for device autocomplete search.
     */
    async searchDevices(query: string): Promise<DeviceSearchResult[]> {
        const trimmedQuery = query.trim();
        if (trimmedQuery.length < 2) {
            return [];
        }

        const searchPattern = `%${trimmedQuery}%`;
        const prefixPattern = `${trimmedQuery}%`;

        return this.db
            .select({
                id: devices.id,
                brand: devices.brand,
                model: devices.model,
                series: devices.series,
                rank: sql<number>`
                    CASE
                        WHEN ${devices.model} ILIKE ${trimmedQuery} THEN 1
                        WHEN ${devices.model} ILIKE ${prefixPattern} THEN 2
                        WHEN ${devices.brand} ILIKE ${prefixPattern} THEN 3
                        ELSE 4
                    END
                `.as('search_rank')
            })
            .from(devices)
            .where(
                and(
                    eq(devices.tenantId, this.tenantId),
                    or(
                        ilike(devices.brand, searchPattern),
                        ilike(devices.model, searchPattern)
                    )
                )
            )
            .orderBy(asc(sql`search_rank`), asc(devices.brand), asc(devices.model))
            .limit(10);
    }

    /**
     * STEP 3: Fetch products joined with devices.
     */
    private async fetchProductDeviceRows() {
        return this.db
            .select({
                productId: products.id,
                productName: products.name,
                deviceId: devices.id,
                deviceBrand: devices.brand,
                deviceModel: devices.model,
                deviceSeries: devices.series
            })
            .from(products)
            .innerJoin(
                productDeviceCompatibility, 
                eq(productDeviceCompatibility.productId, products.id)
            )
            .innerJoin(
                devices, 
                eq(productDeviceCompatibility.deviceId, devices.id)
            )
            .where(
                and(
                    eq(products.tenantId, this.tenantId),
                    eq(productDeviceCompatibility.tenantId, this.tenantId),
                    eq(devices.tenantId, this.tenantId)
                )
            );
    }

    /**
     * STEP 4: Group raw rows into a nested structure.
     */
    private groupProducts(rows: any[]): CatalogProduct[] {
        const productMap = new Map<string, CatalogProduct>();

        for (const row of rows) {
            if (!productMap.has(row.productId)) {
                productMap.set(row.productId, {
                    id: row.productId,
                    name: row.productName,
                    compatibleDevices: []
                });
            }

            const product = productMap.get(row.productId)!;
            
            // Avoid duplicate devices just in case
            if (!product.compatibleDevices.some(d => d.id === row.deviceId)) {
                product.compatibleDevices.push({
                    id: row.deviceId,
                    brand: row.deviceBrand,
                    model: row.deviceModel,
                    series: row.deviceSeries
                });
            }
        }

        return Array.from(productMap.values());
    }

    /**
     * STEP 5: Generate the professional catalog title.
     * Logic: Brand + Models (separated by /) + Brand 2 + Models 2
     */
    private buildCatalogTitle(product: CatalogProduct): string {
        if (product.compatibleDevices.length === 0) {
            return product.name;
        }

        // Group by brand
        const brandGroups = new Map<string, string[]>();
        
        for (const device of product.compatibleDevices) {
            if (!brandGroups.has(device.brand)) {
                brandGroups.set(device.brand, []);
            }
            const models = brandGroups.get(device.brand)!;
            if (!models.includes(device.model)) {
                models.push(device.model);
            }
        }

        const brandParts: string[] = [];
        
        for (const [brand, models] of brandGroups.entries()) {
            const modelsStr = models.join(' / ');
            brandParts.push(`${brand} ${modelsStr}`);
        }

        const compatibilityStr = brandParts.join(' / ');
        
        return `${product.name} ${compatibilityStr}`;
    }
}
