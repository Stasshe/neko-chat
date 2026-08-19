import { createClient, type User } from "@supabase/supabase-js";

import { AppError } from "@/types/app";

export async function authenticate(request: Request): Promise<User> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError("UNAUTHORIZED", "ログイン状態を確認してください。");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new AppError("CONFIGURATION_ERROR", "Supabase Authの接続情報がありません。");
  }

  const accessToken = authorization.slice("Bearer ".length);
  const auth = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const { data, error } = await auth.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new AppError("UNAUTHORIZED", "ログインの有効期限が切れています。");
  }
  return data.user;
}
