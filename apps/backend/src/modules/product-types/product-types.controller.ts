import { Context } from 'hono';
import { ProductTypesService } from './product-types.service.js';
import { AppEnv } from '../../core/types/app-env.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';
import { 
  CreateProductTypeSchema, 
  UpdateProductTypeSchema, 
  ProductTypeIdParamSchema,
  CategoryIdParamSchema
} from './schemas/product-types.schemas.js';
import { CreateProductTypeInput, UpdateProductTypeInput } from './types.js';

/**
 * Controller for Product Types endpoints
 */
export class ProductTypesController {
  constructor(private readonly service: ProductTypesService) {}

  /**
   * List all product types
   */
  async listProductTypes(c: Context<AppEnv>) {
    try {
      const data = await this.service.getProductTypes();
      return successResponse(c, data, 'Product types retrieved successfully');
    } catch (error: any) {
      return errorResponse(c, 'Failed to fetch product types', error.message);
    }
  }

  /**
   * Get product type by ID
   */
  async getProductType(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      ProductTypeIdParamSchema.parse({ id });

      const data = await this.service.getProductTypeById(id!);
      if (!data) {
        return errorResponse(c, 'Not Found', 'Product type not found', 404);
      }
      return successResponse(c, data, 'Product type retrieved successfully');
    } catch (error: any) {
      return errorResponse(c, 'Failed to fetch product type', error.message);
    }
  }

  /**
   * Get product types by category ID
   */
  async getProductTypesByCategory(c: Context<AppEnv>) {
    try {
      const categoryId = c.req.param('categoryId');
      CategoryIdParamSchema.parse({ categoryId });

      const data = await this.service.getProductTypesByCategory(categoryId!);
      return successResponse(c, data, 'Product types for category retrieved successfully');
    } catch (error: any) {
      return errorResponse(c, 'Failed to fetch product types for category', error.message);
    }
  }

  /**
   * Create product type
   */
  async createProductType(c: Context<AppEnv>) {
    try {
      const body = await c.req.json();
      const validated = CreateProductTypeSchema.parse(body);
      
      const data = await this.service.createProductType(validated as CreateProductTypeInput);
      return successResponse(c, data, 'Product type created successfully', 201);
    } catch (error: any) {
      return errorResponse(c, 'Failed to create product type', error.message, 400);
    }
  }

  /**
   * Update product type
   */
  async updateProductType(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      ProductTypeIdParamSchema.parse({ id });
      
      const body = await c.req.json();
      const validated = UpdateProductTypeSchema.parse(body);
      
      const result = await this.service.updateProductType(id!, validated as UpdateProductTypeInput);
      if (!result) {
        return errorResponse(c, 'Not Found', 'Product type not found', 404);
      }
      return successResponse(c, result, 'Product type updated successfully');
    } catch (error: any) {
      return errorResponse(c, 'Failed to update product type', error.message, 400);
    }
  }

  /**
   * Delete product type
   */
  async deleteProductType(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      ProductTypeIdParamSchema.parse({ id });

      const success = await this.service.deleteProductType(id!);
      if (!success) {
        return errorResponse(c, 'Not Found', 'Product type not found or delete failed', 404);
      }
      return successResponse(c, null, 'Product type deleted successfully');
    } catch (error: any) {
      return errorResponse(c, 'Failed to delete product type', error.message);
    }
  }
}
