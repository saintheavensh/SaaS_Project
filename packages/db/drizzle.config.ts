import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: "../../apps/backend/.env" });

export default {
    schema: "./src/schema/index.ts",
    out: "./migrations",
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL!,
    }
} satisfies Config;
