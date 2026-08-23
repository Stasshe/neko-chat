import type { useRouter } from "next/navigation";

import { getSupabaseClient } from "@/lib/supabase/client";

import { isUnauthorized } from "./app-provider-shared";

type Router = ReturnType<typeof useRouter>;

export function createAuthErrorHandler(router: Router) {
  return async function handleAuthError(error: Error): Promise<boolean> {
    if (!isUnauthorized(error)) {
      return false;
    }
    // Clear the stale session before redirecting. Otherwise isAuthenticated stays true,
    // "/" immediately bounces back to "/home", and the app loops 401s forever.
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    router.replace("/");
    return true;
  };
}
