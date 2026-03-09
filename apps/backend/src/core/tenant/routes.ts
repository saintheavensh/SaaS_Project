import { Hono } from 'hono';
import * as tenantController from './controller.js';

export const tenantRouter = new Hono();

/**
 * @swagger
 * /tenants:
 *   post:
 *     tags: [Tenants]
 *     summary: Create a new system tenant (Super Admin Only)
 */
tenantRouter.post('/', tenantController.create);

/**
 * @swagger
 * /tenants/{id}:
 *   get:
 *     tags: [Tenants]
 *     summary: Get specific tenant details by ID
 */
tenantRouter.get('/:id', tenantController.getOne);

/**
 * @swagger
 * /tenants/{id}:
 *   patch:
 *     tags: [Tenants]
 *     summary: Update system tenant configuration or settings
 */
tenantRouter.patch('/:id', tenantController.update);

/**
 * @swagger
 * /tenants/{id}:
 *   delete:
 *     tags: [Tenants]
 *     summary: Permanently remove a tenant and its associated data
 */
tenantRouter.delete('/:id', tenantController.remove);
