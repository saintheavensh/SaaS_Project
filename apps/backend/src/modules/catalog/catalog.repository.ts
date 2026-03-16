import { eq, and } from 'drizzle-orm';
import { Database, TenantRepository } from '../../core/database/tenant-repository-base.js';
import { products, devices, productDeviceCompatibility } from '@my-saas-app/db';
import { CatalogDevice, CatalogProduct, CatalogDisplay } from './types.js';

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
