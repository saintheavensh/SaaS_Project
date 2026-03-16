import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

/**
 * Initialize Drizzle client with Supabase (skeleton)
 */
export const initDb = (connectionString: string) => {
    const client = postgres(connectionString);
    return drizzle(client, { schema });
};

export * from './schema/index.js';
