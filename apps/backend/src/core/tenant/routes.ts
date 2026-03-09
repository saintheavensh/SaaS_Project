import { Hono } from 'hono';
import * as tenantController from './controller.js';

export const tenantRouter = new Hono();

/**
 * @swagger
 * /tenants:
 *   post:
 *     summary: Create a new tenant
 */
tenantRouter.post('/', tenantController.create);

/**
 * @swagger
 * /tenants/{id}:
 *   get:
 *     summary: Get tenant by ID
 */
tenantRouter.get('/:id', tenantController.getOne);

/**
 * @swagger
 * /tenants/{id}:
 *   patch:
 *     summary: Update tenant
 */
tenantRouter.patch('/:id', tenantController.update);

/**
 * @swagger
 * /tenants/{id}:
 *   delete:
 *     summary: Delete tenant
 */
tenantRouter.delete('/:id', tenantController.remove);
