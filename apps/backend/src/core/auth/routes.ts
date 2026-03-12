import { AppEnv } from '../types/app-env.js';
import { Hono } from 'hono';
import * as authController from './controller.js';

export const authRouter = new Hono<AppEnv>();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 */
authRouter.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 */
authRouter.post('/login', authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 */
authRouter.post('/logout', authController.logout);
