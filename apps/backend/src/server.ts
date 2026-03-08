import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from 'hono/adapter';
import 'dotenv/config';
import router from './routes.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Base Route
app.get('/', (c) => {
    return c.json({
        message: 'SaaS Backend API',
        version: '1.0.0',
        status: 'running'
    });
});

// Routes Registration
app.route('/api/v1', router);

// Swagger Documentation Setup (Placeholder)
// In a real implementation, we would use swagger-jsdoc and swagger-ui-express here.
// Since this is Hono, we might use @hono/zod-openapi or similar for better DX.

const port = process.env.PORT || 4000;

console.log(`Server is running on port ${port}`);

export default {
    port,
    fetch: app.fetch,
};
