import { Context } from 'hono';
import { CategoryService } from './categories.service.js';
import { CategoryRepository } from './categories.repository.js';
import { db } from '../../core/db.js';
import { AppEnv } from '../../core/types/app-env.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';

/**
 * Controller for Category endpoints
 */
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  /**
   * List all categories
   */
  async listCategories(c: Context<AppEnv>) {
    try {
      const categories = await this.service.getCategories();
      return successResponse(c, categories, 'Categories retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to fetch categories', message);
    }
  }

  /**
   * Get category by ID
   */
  async getCategory(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      const category = await this.service.getCategoryById(id!);
      if (!category) {
        return errorResponse(c, 'Not Found', 'Category not found', 404);
      }
      
      return successResponse(c, category, 'Category retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to fetch category', message);
    }
  }

  /**
   * Create category
   */
  async createCategory(c: Context<AppEnv>) {
    try {
      const body = await c.req.json();
      const category = await this.service.createCategory(body);
      return successResponse(c, category, 'Category created successfully', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to create category', message, 400);
    }
  }

  /**
   * Update category
   */
  async updateCategory(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      const body = await c.req.json();
      const result = await this.service.updateCategory(id!, body);
      if (!result) {
        return errorResponse(c, 'Not Found', 'Category not found', 404);
      }
      
      return successResponse(c, result, 'Category updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to update category', message, 400);
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      const success = await this.service.deleteCategory(id!);
      if (!success) {
        return errorResponse(c, 'Not Found', 'Category not found or delete failed', 404);
      }
      
      return successResponse(c, null, 'Category deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to delete category', message);
    }
  }
}
