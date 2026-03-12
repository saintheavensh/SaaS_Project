import { AppEnv } from '../../core/types/app-env.js';
import { Hono } from 'hono';
import * as permissionController from './controller.js';
import { authMiddleware } from '../../core/middlewares/authMiddleware.js';
import { tenantContextMiddleware } from '../../core/middlewares/tenantContextMiddleware.js';

export const permissionRouter = new Hono<AppEnv>();

// Apply auth and tenant context middleware to all permission routes
permissionRouter.use('*', authMiddleware);
permissionRouter.use('*', tenantContextMiddleware);

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     tags: [Permissions]
 *     summary: List all permissions
 */
permissionRouter.get('/', permissionController.getPermissionsHandler);

/**
 * @swagger
 * /api/permissions/{id}:
 *   get:
 *     tags: [Permissions]
 *     summary: Get specific permission detail
 */
permissionRouter.get('/:id', permissionController.getPermissionHandler);

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     tags: [Permissions]
 *     summary: Create a new global permission
 */
permissionRouter.post('/', permissionController.createPermissionHandler);

/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     tags: [Permissions]
 *     summary: Update a global permission
 */
permissionRouter.put('/:id', permissionController.updatePermissionHandler);

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     tags: [Permissions]
 *     summary: Remove a global permission
 */
permissionRouter.delete('/:id', permissionController.deletePermissionHandler);
