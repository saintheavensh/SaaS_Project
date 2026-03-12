import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';

export const inventoryRouter = new Hono<AppEnv>();

inventoryRouter.get('/', (c) => c.json({ message: 'Inventory module placeholder' }));
