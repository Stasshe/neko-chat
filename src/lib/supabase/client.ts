import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/config/public";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const env = getPublicEnv();
  if (!env) {
    return null;
  }

  if (!client) {
    client = createClient(env.supabaseUrl, env.supabasePublishableKey, {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}
