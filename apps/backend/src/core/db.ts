import { initDb } from '@my-saas-app/db';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

export const db = initDb(connectionString);
