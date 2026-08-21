"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

import { CatDisplay } from "@/components/cat-display";
import { ArrowLeftIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { ErrorState, LoadingState } from "@/components/status";
import { useApp } from "@/state/app-provider";

export default function SettingsPage() {
  const { profile, loading, error, saveProfile, signOut } = useApp();
  const [username, setUsername] = useState("");
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
    }
  }, [profile]);

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
              <label htmlFor="username">名前</label>
              <input
                id="username"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
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
        <button className="primary-button" type="submit" disabled={loading || !profile}>
          保存する
        </button>
        <button className="logout-button" type="button" onClick={() => void signOut()}>
          ログアウト
        </button>
      </form>
    </MobileShell>
  );
}
