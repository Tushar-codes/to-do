CREATE TABLE IF NOT EXISTS "todos" (
  "id" uuid PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "completed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
