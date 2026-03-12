import { AppEnv } from '../../core/types/app-env.js';
import { Hono } from 'hono';
import * as userController from './controller.js';
import { authMiddleware } from '../../core/middlewares/authMiddleware.js';
import { tenantContextMiddleware } from '../../core/middlewares/tenantContextMiddleware.js';

export const userRouter = new Hono<AppEnv>();

// Apply global middlewares for this module
userRouter.use('*', authMiddleware);
userRouter.use('*', tenantContextMiddleware);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users for tenure
 */
userRouter.get('/', userController.getUsers);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 */
userRouter.get('/me', userController.getProfile);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 */
userRouter.get('/:id', userController.getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user
 */
userRouter.post('/', userController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user
 */
userRouter.put('/:id', userController.updateUser);
