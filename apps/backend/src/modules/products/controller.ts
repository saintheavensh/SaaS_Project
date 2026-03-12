import { Context } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { ProductsService } from './service.js';
import { ProductsRepository } from './repository.js';
import { db } from '../../core/db.js';
import { CreateProductSchema, UpdateProductSchema, ProductIdParamSchema } from './schemas/products.schemas.js';

/**
 * Controller for Products endpoints.
 */
export class ProductsController {
    /**
     * Get a product by ID
     */
    async getProduct(c: Context<AppEnv>) {
        const tenantId = c.get('tenantId') as string;
        const id = c.req.param('id') as string;
        
        if (!tenantId) throw new Error('Tenant ID is required');
        
        ProductIdParamSchema.parse({ id });
        
        const repository = new ProductsRepository(db, tenantId);
        const service = new ProductsService(tenantId, repository);
        
        const result = await service.getProduct(id);
        
        if (!result) {
            return c.json({ error: 'Product not found' }, 404);
        }
        
        return c.json({
            success: true,
            data: result,
        });
    }

    /**
     * Create a new product
     */
    async createProduct(c: Context<AppEnv>) {
        const tenantId = c.get('tenantId') as string;
        const body = await c.req.json();
        
        if (!tenantId) throw new Error('Tenant ID is required');

        const validated = CreateProductSchema.parse(body);
        
        const repository = new ProductsRepository(db, tenantId);
        const service = new ProductsService(tenantId, repository);
        
        const result = await service.createProduct(validated);
        
        return c.json({
            success: true,
            data: result,
        }, 201);
    }

    /**
     * Update an existing product
     */
    async updateProduct(c: Context<AppEnv>) {
        const tenantId = c.get('tenantId') as string;
        const id = c.req.param('id') as string;
        const body = await c.req.json();
        
        if (!tenantId) throw new Error('Tenant ID is required');

        ProductIdParamSchema.parse({ id });
        const validated = UpdateProductSchema.parse(body);
        
        const repository = new ProductsRepository(db, tenantId);
        const service = new ProductsService(tenantId, repository);
        
        const result = await service.updateProduct(id, validated);
        
        return c.json({
            success: true,
            data: result,
        });
    }
}
