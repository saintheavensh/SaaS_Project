import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../apps/backend/.env" });

export default defineConfig({
    schema: "./src/schema/index.ts",
    out: "./migrations",
    dialect: "postgresql", // ✅ INI YANG BENAR
    dbCredentials: {
        url: process.env.DATABASE_URL!, // ✅ BUKAN connectionString
    },
});