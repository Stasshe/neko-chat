"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getPostLoginPath } from "@/lib/auth/get-post-login-path";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasStarted = useRef(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    async function completeLogin() {
      try {
        const client = getSupabaseClient();
        if (!client) {
          if (isMounted.current) {
            setErrorMessage("認証設定を確認してください。");
          }
          return;
        }

        const code = new URLSearchParams(window.location.search).get("code");
        if (!code) {
          if (isMounted.current) {
            setErrorMessage("ログイン情報を受け取れませんでした。");
          }
          return;
        }

        const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("Failed to exchange auth code", exchangeError);

          if (isMounted.current) {
            setErrorMessage("ログイン処理を完了できませんでした。もう一度お試しください。");
          }
          return;
        }

        const nextPath = await getPostLoginPath();

        if (!isMounted.current) {
          return;
        }

        router.replace(nextPath);
      } catch (error) {
        console.error("Failed to complete login", error);

        if (isMounted.current) {
          setErrorMessage("ログイン処理を完了できませんでした。もう一度お試しください。");
        }
      }
    }

    if (!hasStarted.current) {
      hasStarted.current = true;
      void completeLogin();
    }

    return () => {
      isMounted.current = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">{errorMessage ?? "ログインしています…"}</p>
    </main>
  );
}
