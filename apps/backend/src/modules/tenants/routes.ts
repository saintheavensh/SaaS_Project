import { Hono } from 'hono';
import * as tenantController from './controller.js';
import { authMiddleware } from '../../core/middlewares/authMiddleware.js';
// Note: tenantContextMiddleware is technically for scoping sub-resources by tenant_id.
// For the tenants table itself, it's often more about admin/super-admin access.
// However, the prompt specifically requested to apply both.

export const tenantRouter = new Hono();

// Apply global middlewares
tenantRouter.use('*', authMiddleware);

/**
 * @swagger
 * /tenants:
 *   get:
 *     tags: [Tenants]
 *     summary: List all tenants
 */
tenantRouter.get('/', tenantController.getTenants);

/**
 * @swagger
 * /tenants/{id}:
 *   get:
 *     tags: [Tenants]
 *     summary: Get tenant details by ID
 */
tenantRouter.get('/:id', tenantController.getTenantById);

/**
 * @swagger
 * /tenants:
 *   post:
 *     tags: [Tenants]
 *     summary: Create a new tenant
 */
tenantRouter.post('/', tenantController.createTenant);

/**
 * @swagger
 * /tenants/{id}:
 *   put:
 *     tags: [Tenants]
 *     summary: Update an existing tenant
 */
tenantRouter.put('/:id', tenantController.updateTenant);

/**
 * @swagger
 * /tenants/{id}:
 *   delete:
 *     tags: [Tenants]
 *     summary: Delete a tenant
 */
tenantRouter.delete('/:id', tenantController.deleteTenant);
