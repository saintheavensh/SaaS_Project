import { Hono } from 'hono';
import * as tenantController from './controller.js';
import { authMiddleware } from '../../core/middlewares/authMiddleware.js';
import { requirePermission } from '../../core/middlewares/requirePermission.js';

export const tenantRouter = new Hono();

// Apply authentication globally
tenantRouter.use('*', authMiddleware);

/**
 * @swagger
 * /tenants:
 *   get:
 *     tags: [Tenants]
 *     summary: List all tenants
 */
tenantRouter.get('/', requirePermission('tenant.read'), tenantController.getTenants);

/**
 * @swagger
 * /tenants/{id}:
 *   get:
 *     tags: [Tenants]
 *     summary: Get tenant details by ID
 */
tenantRouter.get('/:id', requirePermission('tenant.read'), tenantController.getTenantById);

/**
 * @swagger
 * /tenants:
 *   post:
 *     tags: [Tenants]
 *     summary: Create a new tenant
 */
tenantRouter.post('/', requirePermission('tenant.create'), tenantController.createTenant);

/**
 * @swagger
 * /tenants/{id}:
 *   put:
 *     tags: [Tenants]
 *     summary: Update an existing tenant
 */
tenantRouter.put('/:id', requirePermission('tenant.update'), tenantController.updateTenant);

/**
 * @swagger
 * /tenants/{id}:
 *   delete:
 *     tags: [Tenants]
 *     summary: Delete a tenant
 */
tenantRouter.delete('/:id', requirePermission('tenant.delete'), tenantController.deleteTenant);
