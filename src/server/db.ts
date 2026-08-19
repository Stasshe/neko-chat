import postgres, { type Sql } from "postgres";

let client: Sql | null = null;

export function getDatabase(): Sql {
  const databaseUrl = process.env.SUPABASE_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("SUPABASE_DATABASE_URL is not set");
  }

  if (!client) {
    client = postgres(databaseUrl, {
      idle_timeout: 20,
      max: 5,
      prepare: false,
    });
  }

  return client;
}
