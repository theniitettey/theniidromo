import { neon } from "@neondatabase/serverless";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;

// Use the standard TCP Postgres driver if connecting to localhost
// Otherwise, use Neon's serverless HTTP proxy driver
export const sql =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1")
    ? (postgres(connectionString, { onnotice: () => {} }) as any)
    : neon(connectionString);
