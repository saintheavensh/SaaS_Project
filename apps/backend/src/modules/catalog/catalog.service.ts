import { CatalogRepository } from './catalog.repository.js';
import { CatalogDisplay } from './types.js';

/**
 * Service for Catalog operations
 */
export class CatalogService {
    constructor(private readonly catalogRepository: CatalogRepository) {}

    /**
     * Get the catalog display data for the current tenant
     */
    async getCatalogDisplay(): Promise<CatalogDisplay[]> {
        return this.catalogRepository.getCatalogDisplay();
    }
}
