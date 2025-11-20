import dotenv from "dotenv";
import path from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Please configure your database.");
}

const shouldUseSSL = process.env.DATABASE_SSL === "true";

const pool = new Pool({
  connectionString,
  ssl: shouldUseSSL
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
});

export const db = drizzle(pool);
export const connectionPool = pool;
