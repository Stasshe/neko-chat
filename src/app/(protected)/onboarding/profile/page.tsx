"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/button";
import { CatDisplay } from "@/components/cat-display";
import { MobileShell } from "@/components/mobile-shell";
import { ErrorState } from "@/components/status";
import { TextField } from "@/components/text-field";
import { useApp } from "@/state/app-provider";

export default function ProfileOnboardingPage() {
  const router = useRouter();
  const { profile, loading, error, saveProfile } = useApp();
  const [username, setUsername] = useState(
    profile?.username === "ななしの猫" ? "" : (profile?.username ?? ""),
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = username.trim();
    if (value.length < 1 || value.length > 20) {
      setValidationError("名前は1〜20文字で入力してください。");
      return;
    }
    setValidationError(null);
    try {
      await saveProfile(value, profile?.catType ?? "white");
      window.localStorage.setItem("neko-chat.username", value);
      router.push("/onboarding/mode");
    } catch {
      // The provider exposes the actionable error message.
    }
  }

  return (
    <MobileShell>
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
          <Button type="submit" disabled={loading}>
            {loading ? "保存中" : "つぎへ"}
          </Button>
        </form>
      </section>
    </MobileShell>
  );
}
