import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';

export const productsRouter = new Hono<AppEnv>();

productsRouter.get('/', (c) => c.json({ message: 'Products module placeholder' }));
