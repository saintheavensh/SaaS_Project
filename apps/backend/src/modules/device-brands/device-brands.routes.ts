import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { DeviceBrandController } from './device-brands.controller.js';

const deviceBrandRouter = new Hono<AppEnv>();
const controller = new DeviceBrandController();

/**
 * Device Brand CRUD routes
 */
deviceBrandRouter.get('/', (c) => controller.listDeviceBrands(c));
deviceBrandRouter.get('/:id', (c) => controller.getDeviceBrand(c));
deviceBrandRouter.post('/', (c) => controller.createDeviceBrand(c));
deviceBrandRouter.put('/:id', (c) => controller.updateDeviceBrand(c));
deviceBrandRouter.delete('/:id', (c) => controller.deleteDeviceBrand(c));

export { deviceBrandRouter };
