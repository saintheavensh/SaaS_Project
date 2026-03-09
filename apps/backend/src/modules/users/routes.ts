//apps/backend/src/modules/users/routes.ts
import { Hono } from 'hono';
import * as userController from './controller.js';

export const userRouter = new Hono();

// Placeholders for Step 1
userRouter.post('/', userController.createUser);
userRouter.get('/', userController.getUsers);
userRouter.get('/me', userController.getProfile);
userRouter.get('/:id', userController.getUserById);
userRouter.put('/:id', userController.updateUser);
