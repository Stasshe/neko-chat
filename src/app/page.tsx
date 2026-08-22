"use client";

import { redirect, useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { useAuth } from "@/lib/auth/use-auth";
import { getSupabaseClient } from "@/lib/supabase/client";

type EmailMode = "signin" | "signup";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [emailMode, setEmailMode] = useState<EmailMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthLoading) {
    return <main className="min-h-screen bg-background text-foreground" />;
  }
  if (isAuthenticated) {
    redirect("/home");
  }

  async function handleGoogleLogin() {
    const client = getSupabaseClient();
    if (!client) {
      setError("認証設定を確認してください。");
      return;
    }

    setError(null);
    setIsSigningIn(true);
    const { error: signInError } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/onboarding/profile` },
    });

    if (signInError) {
      setError("ログインに失敗しました。もう一度お試しください。");
      setIsSigningIn(false);
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseClient();
    if (!client) {
      setError("認証設定を確認してください。");
      return;
    }

    setError(null);
    setNotice(null);
    setIsSigningIn(true);

    if (emailMode === "signin") {
      const { error: signInError } = await client.auth.signInWithPassword({ email, password });
      setIsSigningIn(false);
      if (signInError) {
        console.error("Sign in failed.", signInError);
        setError("メールアドレスまたはパスワードが違います。");
        return;
      }
      router.replace("/home");
      return;
    }

    const { data, error: signUpError } = await client.auth.signUp({ email, password });
    setIsSigningIn(false);
    if (signUpError) {
      console.error("Sign up failed.", signUpError);
      if (signUpError.code === "user_already_exists") {
        setError("このメールアドレスは登録済みです。ログインしてください。");
        setEmailMode("signin");
        return;
      }
      setError("登録に失敗しました。もう一度お試しください。");
      return;
    }
    if (data.session) {
      router.replace("/home");
      return;
    }
    setNotice("確認メールを送信しました。メール内のリンクから認証してください。");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
        <div className="space-y-4">
          <p className="text-sm tracking-[0.2em] text-muted-foreground">NEKO CHAT</p>
          <h1 className="text-4xl font-bold">猫チャット</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            ゆるく近況を共有する、猫モチーフのグループチャットアプリ
          </p>
        </div>

        <div className="mt-10 w-full space-y-3">
          <button
            type="button"
            onClick={() => void handleGoogleLogin()}
            disabled={isSigningIn}
            className="w-full rounded-xl bg-primary px-5 py-3 text-primary-foreground disabled:opacity-60"
          >
            Googleでログイン
          </button>
        </div>

        <div className="mt-6 flex w-full items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          または
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmailSubmit} className="mt-6 w-full space-y-3 text-left">
          <label htmlFor="email" className="sr-only">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="メールアドレス"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <label htmlFor="password" className="sr-only">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="パスワード"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={isSigningIn}
            className="w-full rounded-xl border border-input px-5 py-3 text-sm font-medium disabled:opacity-60"
          >
            {emailMode === "signin" ? "メールでログイン" : "メールで登録"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEmailMode(emailMode === "signin" ? "signup" : "signin");
              setError(null);
              setNotice(null);
            }}
            className="w-full text-xs text-muted-foreground underline"
          >
            {emailMode === "signin" ? "アカウントを作成する" : "ログインに戻る"}
          </button>
        </form>

        {error ? <p className="mt-4 text-xs text-destructive">{error}</p> : null}
        {notice ? <p className="mt-4 text-xs text-muted-foreground">{notice}</p> : null}
      </div>
    </main>
  );
}
