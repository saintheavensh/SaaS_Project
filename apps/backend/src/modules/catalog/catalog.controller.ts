import { Context } from 'hono';
import { CatalogService } from './catalog.service.js';
import { CatalogRepository } from './catalog.repository.js';
import { db } from '../../core/db.js';
import { AppEnv } from '../../core/types/app-env.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';

/**
 * Controller for Catalog endpoints
 */
export class CatalogController {
    /**
     * Search devices for autocomplete
     */
    async searchDevices(c: Context<AppEnv>) {
        try {
            const tenantId = c.get('tenantId');
            if (!tenantId) {
                return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
            }

            const query = c.req.query('q');
            if (!query) {
                return errorResponse(c, "query parameter 'q' is required", null, 400);
            }

            const repository = new CatalogRepository(db, tenantId);
            const service = new CatalogService(repository);
            
            const results = await service.searchDevices(query);
            
            return successResponse(c, results, 'Devices retrieved successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return errorResponse(c, 'Failed to search devices', message);
        }
    }
}
