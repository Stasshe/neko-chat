"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/button";
import { CatDisplay } from "@/components/cat-display";
import { ArrowLeftIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { ErrorState } from "@/components/status";
import { TextField } from "@/components/text-field";
import { defaultUsername } from "@/lib/profile";
import { useApp } from "@/state/app-provider";

function getInitialUsername(username: string) {
  if (username === defaultUsername) {
    return "";
  }
  return username;
}

export default function ProfileOnboardingPage() {
  const router = useRouter();
  const { profile, error, saveProfile, signOut } = useApp();
  const [username, setUsername] = useState(() => getInitialUsername(profile?.username ?? ""));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = username.trim();
    if (value.length < 1 || value.length > 20) {
      setValidationError("名前は1〜20文字で入力してください。");
      return;
    }
    setValidationError(null);
    setSubmitting(true);
    try {
      await saveProfile(value, profile?.catType ?? "white");
      window.localStorage.setItem("neko-chat.username", value);
      router.replace("/onboarding/mode");
    } catch {
      // The provider exposes the actionable error message.
      setSubmitting(false);
    }
  }

  return (
    <MobileShell>
      <button
        className="page-back"
        type="button"
        aria-label="ログイン画面へ戻る"
        onClick={() => void signOut()}
      >
        <ArrowLeftIcon />
        <span>戻る</span>
      </button>
      <section className="onboarding-form onboarding-form--profile">
        <CatDisplay type="white" emotion="positive" className="onboarding-profile-cat" />
        <h1>まずは名前を教えてね</h1>
        <form onSubmit={submit}>
          <TextField
            id="username"
            label="ユーザー名"
            hideLabel
            value={username}
            onChange={setUsername}
            maxLength={20}
            placeholder="ユーザー名を入力してください"
          />
          {(validationError || error) && <ErrorState message={validationError ?? error ?? ""} />}
          <Button type="submit" pending={submitting}>
            つぎへ
          </Button>
        </form>
      </section>
    </MobileShell>
  );
}
