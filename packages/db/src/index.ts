import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

/**
 * Initialize Drizzle client with Supabase (skeleton)
 */
export const initDb = (connectionString: string) => {
    const client = postgres(connectionString);
    return drizzle(client, { schema });
};

export * from './schema.js';
