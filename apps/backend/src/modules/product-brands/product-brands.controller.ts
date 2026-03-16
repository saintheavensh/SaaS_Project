import { Context } from 'hono';
import { ProductBrandService } from './product-brands.service.js';
import { ProductBrandRepository } from './product-brands.repository.js';
import { db } from '../../core/db.js';
import { AppEnv } from '../../core/types/app-env.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';

/**
 * Controller for Product Brand endpoints
 */
export class ProductBrandController {
  constructor(private readonly service: ProductBrandService) {}

  /**
   * List all brands
   */
  async listBrands(c: Context<AppEnv>) {
    try {
      const brands = await this.service.getBrands();
      return successResponse(c, brands, 'Brands retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to fetch brands', message);
    }
  }

  /**
   * Get brand by ID
   */
  async getBrand(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      const brand = await this.service.getBrandById(id!);
      if (!brand) {
        return errorResponse(c, 'Not Found', 'Brand not found', 404);
      }
      
      return successResponse(c, brand, 'Brand retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to fetch brand', message);
    }
  }

  /**
   * Create brand
   */
  async createBrand(c: Context<AppEnv>) {
    try {
      const body = await c.req.json();
      const brand = await this.service.createBrand(body);
      return successResponse(c, brand, 'Brand created successfully', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to create brand', message, 400);
    }
  }

  /**
   * Update brand
   */
  async updateBrand(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      const body = await c.req.json();
      const result = await this.service.updateBrand(id!, body);
      if (!result) {
        return errorResponse(c, 'Not Found', 'Brand not found', 404);
      }
      
      return successResponse(c, result, 'Brand updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to update brand', message, 400);
    }
  }

  /**
   * Delete brand
   */
  async deleteBrand(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      const success = await this.service.deleteBrand(id!);
      if (!success) {
        return errorResponse(c, 'Not Found', 'Brand not found or delete failed', 404);
      }
      
      return successResponse(c, null, 'Brand deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to delete brand', message);
    }
  }
}
