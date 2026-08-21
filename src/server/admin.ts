import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/config/server";

let client: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  const env = getServerEnv();

  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }
  return client;
}
