import { Context } from 'hono';
import { DeviceBrandService } from './device-brands.service.js';
import { DeviceBrandRepository } from './device-brands.repository.js';
import { db } from '../../core/db.js';
import { AppEnv } from '../../core/types/app-env.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';

/**
 * Controller for Device Brand endpoints
 */
export class DeviceBrandController {
  constructor(private readonly service: DeviceBrandService) {}

  /**
   * List all device brands
   */
  async listDeviceBrands(c: Context<AppEnv>) {
    try {
      const brands = await this.service.getDeviceBrands();
      return successResponse(c, brands, 'Device brands retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to fetch device brands', message);
    }
  }

  /**
   * Get device brand by ID
   */
  async getDeviceBrand(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      const brand = await this.service.getDeviceBrandById(id!);
      if (!brand) {
        return errorResponse(c, 'Not Found', 'Device brand not found', 404);
      }
      
      return successResponse(c, brand, 'Device brand retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to fetch device brand', message);
    }
  }

  /**
   * Create device brand
   */
  async createDeviceBrand(c: Context<AppEnv>) {
    try {
      const body = await c.req.json();
      const brand = await this.service.createDeviceBrand(body);
      return successResponse(c, brand, 'Device brand created successfully', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to create device brand', message, 400);
    }
  }

  /**
   * Update device brand
   */
  async updateDeviceBrand(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      const body = await c.req.json();
      const result = await this.service.updateDeviceBrand(id!, body);
      if (!result) {
        return errorResponse(c, 'Not Found', 'Device brand not found', 404);
      }
      
      return successResponse(c, result, 'Device brand updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to update device brand', message, 400);
    }
  }

  /**
   * Delete device brand
   */
  async deleteDeviceBrand(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      const success = await this.service.deleteDeviceBrand(id!);
      if (!success) {
        return errorResponse(c, 'Not Found', 'Device brand not found or delete failed', 404);
      }
      
      return successResponse(c, null, 'Device brand deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to delete device brand', message);
    }
  }
}
