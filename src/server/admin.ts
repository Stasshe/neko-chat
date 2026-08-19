import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { AppError } from "@/types/app";

let client: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new AppError("CONFIGURATION_ERROR", "Supabaseのサーバー接続情報がありません。");
  }

  if (!client) {
    client = createClient(url, secretKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }
  return client;
}
