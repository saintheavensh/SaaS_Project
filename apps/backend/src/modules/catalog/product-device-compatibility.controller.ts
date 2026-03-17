import { Context } from 'hono';
import { ProductDeviceCompatibilityService } from './product-device-compatibility.service.js';
import { AppEnv } from '../../core/types/app-env.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';
import { CreateCompatibilitySchema, UpdateCompatibilitySchema, CompatibilityIdParamSchema } from './product-device-compatibility.schemas.js';
import { CreateProductDeviceCompatibilityInput, UpdateProductDeviceCompatibilityInput } from './product-device-compatibility.types.js';

/**
 * Controller for Product-Device Compatibility endpoints
 */
export class ProductDeviceCompatibilityController {
  constructor(private readonly service: ProductDeviceCompatibilityService) {}

  /**
   * List all compatibility mappings
   */
  async listCompatibilities(c: Context<AppEnv>) {
    try {
      const data = await this.service.getCompatibilities();
      return successResponse(c, data, 'Compatibility mappings retrieved successfully');
    } catch (error: any) {
      return errorResponse(c, 'Failed to fetch compatibility mappings', error.message);
    }
  }

  /**
   * Get compatibility mapping by ID
   */
  async getCompatibility(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      CompatibilityIdParamSchema.parse({ id });

      const data = await this.service.getCompatibilityById(id!);
      if (!data) {
        return errorResponse(c, 'Not Found', 'Compatibility mapping not found', 404);
      }
      return successResponse(c, data, 'Compatibility mapping retrieved successfully');
    } catch (error: any) {
      return errorResponse(c, 'Failed to fetch compatibility mapping', error.message);
    }
  }

  /**
   * Create compatibility mapping
   */
  async createCompatibility(c: Context<AppEnv>) {
    try {
      const body = await c.req.json();
      const validated = CreateCompatibilitySchema.parse(body);
      
      const data = await this.service.createCompatibility(validated as CreateProductDeviceCompatibilityInput);
      return successResponse(c, data, 'Compatibility mapping created successfully', 201);
    } catch (error: any) {
      return errorResponse(c, 'Failed to create compatibility mapping', error.message, 400);
    }
  }

  /**
   * Update compatibility mapping
   */
  async updateCompatibility(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      CompatibilityIdParamSchema.parse({ id });
      
      const body = await c.req.json();
      const validated = UpdateCompatibilitySchema.parse(body);
      
      const result = await this.service.updateCompatibility(id!, validated as UpdateProductDeviceCompatibilityInput);
      if (!result) {
        return errorResponse(c, 'Not Found', 'Compatibility mapping not found', 404);
      }
      return successResponse(c, result, 'Compatibility mapping updated successfully');
    } catch (error: any) {
      return errorResponse(c, 'Failed to update compatibility mapping', error.message, 400);
    }
  }

  /**
   * Delete compatibility mapping
   */
  async deleteCompatibility(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      CompatibilityIdParamSchema.parse({ id });

      const success = await this.service.deleteCompatibility(id!);
      if (!success) {
        return errorResponse(c, 'Not Found', 'Compatibility mapping not found or delete failed', 404);
      }
      return successResponse(c, null, 'Compatibility mapping deleted successfully');
    } catch (error: any) {
      return errorResponse(c, 'Failed to delete compatibility mapping', error.message);
    }
  }
}
