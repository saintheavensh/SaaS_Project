import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { CatalogController } from './catalog.controller.js';

const catalogRouter = new Hono<AppEnv>();
const controller = new CatalogController();

/**
 * Device Search Autocomplete endpoint
 */
catalogRouter.get('/devices/search', (c) => controller.searchDevices(c));

export { catalogRouter };
