import { Context } from 'hono';
import { SupplierService } from './suppliers.service.js';
import { SupplierRepository } from './suppliers.repository.js';
import { db } from '../../core/db.js';
import { AppEnv } from '../../core/types/app-env.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';

/**
 * Controller for Supplier endpoints
 */
export class SupplierController {
  /**
   * List all suppliers
   */
  async listSuppliers(c: Context<AppEnv>) {
    try {
      const tenantId = c.get('tenantId');
      if (!tenantId) {
        return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
      }

      const repository = new SupplierRepository(db, tenantId);
      const service = new SupplierService(repository);
      
      const suppliers = await service.getSuppliers();
      return successResponse(c, suppliers, 'Suppliers retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to fetch suppliers', message);
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplier(c: Context<AppEnv>) {
    try {
      const tenantId = c.get('tenantId');
      const id = c.req.param('id');
      if (!tenantId) {
        return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
      }

      const repository = new SupplierRepository(db, tenantId);
      const service = new SupplierService(repository);
      
      const supplier = await service.getSupplierById(id!);
      if (!supplier) {
        return errorResponse(c, 'Not Found', 'Supplier not found', 404);
      }
      
      return successResponse(c, supplier, 'Supplier retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to fetch supplier', message);
    }
  }

  /**
   * Create supplier
   */
  async createSupplier(c: Context<AppEnv>) {
    try {
      const tenantId = c.get('tenantId');
      if (!tenantId) {
        return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
      }

      const body = await c.req.json();
      const repository = new SupplierRepository(db, tenantId);
      const service = new SupplierService(repository);
      
      const supplier = await service.createSupplier(body);
      return successResponse(c, supplier, 'Supplier created successfully', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to create supplier', message, 400);
    }
  }

  /**
   * Update supplier
   */
  async updateSupplier(c: Context<AppEnv>) {
    try {
      const tenantId = c.get('tenantId');
      const id = c.req.param('id');
      if (!tenantId) {
        return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
      }

      const body = await c.req.json();
      const repository = new SupplierRepository(db, tenantId);
      const service = new SupplierService(repository);
      
      const result = await service.updateSupplier(id!, body);
      if (!result) {
        return errorResponse(c, 'Not Found', 'Supplier not found', 404);
      }
      
      return successResponse(c, result, 'Supplier updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to update supplier', message, 400);
    }
  }

  /**
   * Delete supplier
   */
  async deleteSupplier(c: Context<AppEnv>) {
    try {
      const tenantId = c.get('tenantId');
      const id = c.req.param('id');
      if (!tenantId) {
        return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
      }

      const repository = new SupplierRepository(db, tenantId);
      const service = new SupplierService(repository);
      
      const success = await service.deleteSupplier(id!);
      if (!success) {
        return errorResponse(c, 'Not Found', 'Supplier not found or delete failed', 404);
      }
      
      return successResponse(c, null, 'Supplier deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to delete supplier', message);
    }
  }
}
