import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

export const hasDatabaseUrl = Boolean(databaseUrl);

const client = databaseUrl ? neon(databaseUrl) : null;

export const db = client
  ? drizzle({ client, schema })
  : null;

let bootstrapPromise: Promise<void> | null = null;

export async function ensureDatabaseReady() {
  if (!db) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!bootstrapPromise) {
    bootstrapPromise = db.execute(sql`
      CREATE TABLE IF NOT EXISTS "todos" (
        "id" uuid PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "completed" boolean DEFAULT false NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `).then(() => undefined);
  }

  await bootstrapPromise;
}
