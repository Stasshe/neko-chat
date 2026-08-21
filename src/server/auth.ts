import type { User } from "@supabase/supabase-js";

import { getAdminClient } from "@/server/admin";
import { AppError } from "@/types/app";

export async function authenticate(request: Request): Promise<User> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError("UNAUTHORIZED", "ログイン状態を確認してください。");
  }

  const accessToken = authorization.slice("Bearer ".length);
  const { data, error } = await getAdminClient().auth.getUser(accessToken);
  if (error || !data.user) {
    throw new AppError("UNAUTHORIZED", "ログインの有効期限が切れています。");
  }
  return data.user;
}
