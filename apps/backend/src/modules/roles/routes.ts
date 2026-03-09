import { Hono } from 'hono';
import * as roleController from './controller.js';
import { authMiddleware } from '../../core/middlewares/authMiddleware.js';
import { tenantContextMiddleware } from '../../core/middlewares/tenantContextMiddleware.js';

export const roleRouter = new Hono();

// Apply global middlewares to all role routes
roleRouter.use('*', authMiddleware);
roleRouter.use('*', tenantContextMiddleware);

/**
 * @swagger
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: List all roles for the current tenant
 */
roleRouter.get('/', roleController.getRoles);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Get role details by ID
 */
roleRouter.get('/:id', roleController.getRoleById);

/**
 * @swagger
 * /roles:
 *   post:
 *     tags: [Roles]
 *     summary: Create a new role
 */
roleRouter.post('/', roleController.createRole);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     tags: [Roles]
 *     summary: Update an existing role
 */
roleRouter.put('/:id', roleController.updateRole);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Delete a role
 */
roleRouter.delete('/:id', roleController.deleteRole);
