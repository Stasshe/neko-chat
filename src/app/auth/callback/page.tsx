"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getMyGroups } from "@/lib/api";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function completeLogin() {
      const client = getSupabaseClient();
      if (!client) {
        if (isMounted) {
          setErrorMessage("認証設定を確認してください。");
        }
        return;
      }

      const code = new URLSearchParams(window.location.search).get("code");
      if (!code) {
        if (isMounted) {
          setErrorMessage("ログイン情報を受け取れませんでした。");
        }
        return;
      }

      const { error } = await client.auth.exchangeCodeForSession(code);
      if (error) {
        if (isMounted) {
          setErrorMessage(
            "ログイン情報を確認できませんでした。もう一度お試しください。",
          );
        }
        return;
      }

      const groups = await getMyGroups();

      if (groups.length === 0) {
        router.replace("/onboarding/profile");
        return;
      }

      router.replace("/home");
    }

    void completeLogin();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">
        {errorMessage ?? "ログインしています…"}
      </p>
    </main>
  );
}
