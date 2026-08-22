"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import type { Step } from "react-joyride";

import { CatDisplay } from "@/components/cat-display";
import { ArrowLeftIcon, SendIcon, SettingsIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { OnboardingTour } from "@/components/onboarding-tour";
import { ErrorState } from "@/components/status";
import { tourStorageKey } from "@/lib/tour";
import { useApp } from "@/state/app-provider";
import { type Emotion, emotions } from "@/types/app";

const composeTourSteps: Step[] = [
  {
    target: "#post-body",
    content: "今の気持ちを30文字以内で書いてみよう。",
    placement: "bottom",
  },
  {
    target: ".emotion-picker",
    content: "ねこの表情を選んで気分を伝えよう。",
    placement: "top",
  },
  {
    target: ".send-button",
    content: "つぶやくボタンで投稿完了！",
    placement: "top",
  },
];

const emotionLabels: Record<Emotion, string> = {
  positive: "うれしい",
  neutral: "いつもの",
  negative: "しょんぼり",
  random: "おまかせ",
};

function getButtonLabel(loading: boolean): string {
  if (loading) {
    return "投稿中";
  }
  return "つぶやく";
}

export default function ComposePage() {
  const router = useRouter();
  const { profile, currentGroup, loading, error, publishPost } = useApp();
  const [body, setBody] = useState("");
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [tourRun, setTourRun] = useState(false);

  useEffect(() => {
    if (!currentGroup?.isSolo) {
      return;
    }

    if (window.localStorage.getItem(tourStorageKey) === "compose") {
      setTourRun(true);
    }
  }, [currentGroup]);

  function finishComposeTour() {
    window.localStorage.setItem(tourStorageKey, "done");
    setTourRun(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || trimmed.length > 30) {
      setValidationError("つぶやきは1〜30文字で入力してください。");
      return;
    }
    setValidationError(null);
    try {
      await publishPost(trimmed, emotion);
      router.push("/home");
    } catch {
      // The provider exposes the actionable error message.
    }
  }

  return (
    <MobileShell>
      <OnboardingTour steps={composeTourSteps} run={tourRun} onFinish={finishComposeTour} />
      <header className="compose-header">
        <button type="button" onClick={() => router.push("/home")} aria-label="ホームへ戻る">
          <ArrowLeftIcon />
          <span>ホームへ</span>
        </button>
        <strong>{currentGroup?.name ?? "グループ"}</strong>
        <button type="button" onClick={() => router.push("/settings")} aria-label="設定">
          <SettingsIcon />
          <span>設定</span>
        </button>
      </header>
      <form className="compose-form" onSubmit={submit}>
        <div className="compose-preview">
          <CatDisplay
            type={profile?.catType ?? "white"}
            emotion={emotion}
            className="compose-preview__cat"
            seed={profile?.id ?? "compose-preview"}
          />
          <span>{profile?.username ?? "あなた"}</span>
        </div>
        <label className="sr-only" htmlFor="post-body">
          つぶやき
        </label>
        <textarea
          id="post-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={30}
          placeholder="いまなにしてる？"
        />
        <span className="character-count">{body.length}/30</span>
        <fieldset className="emotion-picker">
          <legend>ねこの表情</legend>
          {emotions.map((value) => (
            <label key={value} data-selected={emotion === value}>
              <input
                type="radio"
                name="emotion"
                value={value}
                checked={emotion === value}
                onChange={() => setEmotion(value)}
              />
              <CatDisplay
                type={profile?.catType ?? "white"}
                emotion={value}
                seed={profile?.id ? `${profile.id}-${value}` : `compose-option-${value}`}
              />
              <span>{emotionLabels[value]}</span>
            </label>
          ))}
        </fieldset>
        {(validationError || error) && <ErrorState message={validationError ?? error ?? ""} />}
        <button className="send-button" type="submit" disabled={loading || !currentGroup}>
          <SendIcon />
          {getButtonLabel(loading)}
        </button>
      </form>
    </MobileShell>
  );
}
