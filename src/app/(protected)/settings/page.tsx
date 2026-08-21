"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/button";
import { CatDisplay } from "@/components/cat-display";
import { ArrowLeftIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { ErrorState, LoadingState } from "@/components/status";
import { TextField } from "@/components/text-field";
import { useApp } from "@/state/app-provider";

export default function SettingsPage() {
  const { profile, loading, error, saveProfile, signOut } = useApp();
  const [editedUsername, setEditedUsername] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const username = editedUsername ?? profile?.username ?? "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || trimmed.length > 20 || !profile) {
      setValidationError("名前は1〜20文字で入力してください。");
      return;
    }
    setValidationError(null);
    setSaved(false);
    try {
      await saveProfile(trimmed, profile.catType);
      setEditedUsername(null);
      setSaved(true);
    } catch {
      // The provider exposes the actionable error message.
    }
  }

  return (
    <MobileShell>
      <header className="settings-header">
        <Link href="/home" aria-label="ホームへ戻る">
          <ArrowLeftIcon />
        </Link>
        <h1>設定</h1>
        <span />
      </header>
      {loading && !profile && <LoadingState label="プロフィールを読み込み中" />}
      <form className="settings-form" onSubmit={submit}>
        <section>
          <h2>プロフィール</h2>
          <div className="settings-profile">
            <CatDisplay type={profile?.catType ?? "white"} />
            <div>
              <TextField
                id="username"
                label="名前"
                labelClassName=""
                value={username}
                onChange={(value) => {
                  setEditedUsername(value);
                  setSaved(false);
                }}
                maxLength={20}
              />
            </div>
          </div>
          <Link className="secondary-button" href="/onboarding/cat?returnTo=settings">
            ねこを選び直す
          </Link>
        </section>
        {(validationError || error) && <ErrorState message={validationError ?? error ?? ""} />}
        {saved && <p className="success-message">プロフィールを更新しました。</p>}
        <Button type="submit" disabled={loading || !profile}>
          保存する
        </Button>
        <Button variant="logout" onClick={() => void signOut()}>
          ログアウト
        </Button>
      </form>
    </MobileShell>
  );
}
