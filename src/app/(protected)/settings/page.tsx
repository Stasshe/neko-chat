"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { ButtonSpinner } from "@/components/button-spinner";
import { LongArrowLeftIcon, LogoutIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { ErrorState, LoadingState } from "@/components/status";
import { TextField } from "@/components/text-field";
import { getGroupInviteCode } from "@/lib/api";
import { useApp } from "@/state/app-provider";
import { AppError, type CatType } from "@/types/app";

const catLabels: Record<CatType, string> = {
  white: "白猫",
  black: "黒猫",
  mike: "三毛猫",
  sham: "シャム猫",
  chatora: "茶トラ",
};

function getSaveButtonContent(submitting: boolean) {
  if (submitting) {
    return <ButtonSpinner label="保存中" />;
  }
  return "保存";
}

function getInviteCodeButtonContent(inviteLoading: boolean) {
  if (inviteLoading) {
    return <ButtonSpinner label="読み込み中" />;
  }
  return "招待コードを表示";
}

function getCopyLabel(copied: boolean) {
  if (copied) {
    return "コピーしました";
  }
  return "コピー";
}

export default function SettingsPage() {
  const { profile, currentGroup, loading, error, saveProfile, signOut } = useApp();
  const [editedUsername, setEditedUsername] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const username = editedUsername ?? profile?.username ?? "";

  async function showInviteCode() {
    if (!currentGroup || inviteCode) {
      return;
    }
    setInviteLoading(true);
    setInviteError(null);
    try {
      const code = await getGroupInviteCode(currentGroup.id);
      setInviteCode(code);
      setInviteLoading(false);
    } catch (requestError) {
      setInviteError(
        requestError instanceof AppError
          ? requestError.message
          : "招待コードを取得できませんでした。",
      );
      setInviteLoading(false);
    }
  }

  async function copyInviteCode() {
    if (!inviteCode) {
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
    } catch (clipboardError) {
      console.error(clipboardError);
      setInviteError("コピーできませんでした。コードを長押ししてコピーしてください。");
    }
  }

  function startEditingUsername() {
    setEditedUsername(profile?.username ?? "");
    setSaved(false);
    setValidationError(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || trimmed.length > 20 || !profile) {
      setValidationError("名前は1〜20文字で入力してください。");
      return;
    }
    setValidationError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      await saveProfile(trimmed, profile.catType);
      setEditedUsername(null);
      setSaved(true);
      setSubmitting(false);
    } catch {
      // The provider exposes the actionable error message.
      setSubmitting(false);
    }
  }

  return (
    <MobileShell>
      <header className="settings-header">
        <Link href="/home" aria-label="ホームへ戻る" className="settings-back">
          <LongArrowLeftIcon />
          <span>戻る</span>
        </Link>
        <h1>設定</h1>
        <span />
      </header>
      {loading && !profile && <LoadingState label="プロフィールを読み込み中" />}
      <div className="settings-content">
        <section className="settings-section">
          <h2>
            <Image src="/images/ui/icons/paw-print.png" alt="" width={13} height={13} />
            ユーザー情報
          </h2>
          <div className="settings-list">
            {editedUsername === null ? (
              <button
                className="settings-row"
                type="button"
                onClick={startEditingUsername}
                disabled={!profile}
              >
                <span className="settings-row__label">
                  <Image src="/images/ui/icons/image 28.png" alt="" width={38} height={28} />
                  <span>ユーザー名</span>
                </span>
                <strong>{profile?.username ?? ""}</strong>
                <span aria-hidden="true">›</span>
              </button>
            ) : (
              <form className="settings-editor" onSubmit={submit}>
                <TextField
                  id="username"
                  label="ユーザー名"
                  hideLabel
                  value={username}
                  onChange={(value) => {
                    setEditedUsername(value);
                    setSaved(false);
                  }}
                  maxLength={20}
                />
                <button type="submit" disabled={submitting || !profile}>
                  {getSaveButtonContent(submitting)}
                </button>
                <button type="button" disabled={submitting} onClick={() => setEditedUsername(null)}>
                  キャンセル
                </button>
              </form>
            )}
            <Link className="settings-row" href="/onboarding/cat?returnTo=settings">
              <span className="settings-row__label">
                <Image
                  src="/images/cats/white/white_shit_posi.png"
                  alt=""
                  width={44}
                  height={38}
                  className="settings-row__cat-icon"
                />
                <span>猫の種類</span>
              </span>
              <strong>{catLabels[profile?.catType ?? "white"]}</strong>
              <span aria-hidden="true">›</span>
            </Link>
          </div>
        </section>
        {currentGroup && !currentGroup.isSolo && (
          <section className="settings-section">
            <h2>
              <Image src="/images/ui/icons/paw-print.png" alt="" width={13} height={13} />
              招待コード
            </h2>
            <div className="settings-list">
              <div className="settings-row settings-row--invite">
                <span className="settings-row__label">
                  <span>{currentGroup.name}</span>
                </span>
                {inviteCode ? (
                  <span className="settings-row__value">
                    <strong>{inviteCode}</strong>
                    <button
                      className="settings-row__action"
                      type="button"
                      onClick={() => void copyInviteCode()}
                    >
                      {getCopyLabel(copied)}
                    </button>
                  </span>
                ) : (
                  <button
                    className="settings-row__action"
                    type="button"
                    disabled={inviteLoading}
                    onClick={() => void showInviteCode()}
                  >
                    {getInviteCodeButtonContent(inviteLoading)}
                  </button>
                )}
              </div>
            </div>
            {inviteError && <ErrorState message={inviteError} />}
          </section>
        )}
        <section className="settings-section">
          <h2>
            <Image src="/images/ui/icons/paw-print.png" alt="" width={13} height={13} />
            アカウント
          </h2>
          <div className="settings-list">
            <button
              className="settings-row settings-row--logout"
              type="button"
              onClick={() => void signOut()}
            >
              <span className="settings-row__label">
                <LogoutIcon />
                <span>ログアウト</span>
              </span>
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </section>
        {(validationError || error) && <ErrorState message={validationError ?? error ?? ""} />}
        {saved && <p className="success-message">プロフィールを更新しました。</p>}
      </div>
    </MobileShell>
  );
}
