import { Hono } from 'hono';
import * as userRoleController from './controller.js';
import { authMiddleware } from '../../core/middlewares/authMiddleware.js';

export const userRoleRouter = new Hono();

// Apply auth middleware to all user-role routes
userRoleRouter.use('*', authMiddleware);

/**
 * @swagger
 * /api/users/{userId}/roles:
 *   get:
 *     tags: [UserRoles]
 *     summary: List all roles assigned to a user
 */
userRoleRouter.get('/:userId/roles', userRoleController.getUserRolesHandler);

/**
 * @swagger
 * /api/users/{userId}/roles:
 *   post:
 *     tags: [UserRoles]
 *     summary: Assign a role to a user
 */
userRoleRouter.post('/:userId/roles', userRoleController.assignRoleHandler);

/**
 * @swagger
 * /api/users/{userId}/roles/{roleId}:
 *   delete:
 *     tags: [UserRoles]
 *     summary: Remove a role from a user
 */
userRoleRouter.delete('/:userId/roles/:roleId', userRoleController.removeRoleHandler);
