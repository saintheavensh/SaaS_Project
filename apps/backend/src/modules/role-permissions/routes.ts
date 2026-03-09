import { Hono } from 'hono';
import * as rolePermissionController from './controller.js';
import { authMiddleware } from '../../core/middlewares/authMiddleware.js';

export const rolePermissionRouter = new Hono();

// Apply auth middleware to all role-permission routes
rolePermissionRouter.use('*', authMiddleware);

/**
 * @swagger
 * /roles/{roleId}/permissions:
 *   get:
 *     tags: [RolePermissions]
 *     summary: List all permissions for a specific role
 */
rolePermissionRouter.get('/:roleId/permissions', rolePermissionController.getRolePermissionsHandler);

/**
 * @swagger
 * /roles/{roleId}/permissions:
 *   post:
 *     tags: [RolePermissions]
 *     summary: Assign a permission to a role
 */
rolePermissionRouter.post('/:roleId/permissions', rolePermissionController.assignPermissionHandler);

/**
 * @swagger
 * /roles/{roleId}/permissions/{permissionId}:
 *   delete:
 *     tags: [RolePermissions]
 *     summary: Remove a permission from a role
 */
rolePermissionRouter.delete('/:roleId/permissions/:permissionId', rolePermissionController.removePermissionHandler);
