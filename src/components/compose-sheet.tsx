"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import type { Step } from "react-joyride";

import { CatDisplay } from "@/components/cat-display";
import { SendIcon } from "@/components/icons";
import { OnboardingTour } from "@/components/onboarding-tour";
import { ErrorState } from "@/components/status";
import { setTourStage, useTourStage } from "@/lib/tour";
import { useApp } from "@/state/app-provider";
import { type Emotion, emotions } from "@/types/app";

const composeTourSteps: Step[] = [
  {
    target: "#post-body",
    content: "今の気持ちを30文字以内で書いてみよう。",
    placement: "top",
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

export function ComposeSheet() {
  const { profile, currentGroup, composeOpen, closeCompose, loading, error, publishPost } =
    useApp();
  const [body, setBody] = useState("");
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const [validationError, setValidationError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const tourStage = useTourStage();
  const tourRun = composeOpen && tourStage === "compose";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (composeOpen && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [composeOpen]);

  function finishComposeTour() {
    setTourStage("done");
  }

  function dismiss() {
    dialogRef.current?.close();
    closeCompose();
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
      setBody("");
      setEmotion("neutral");
      closeCompose();
    } catch {
      // The provider exposes the actionable error message.
    }
  }

  if (!composeOpen) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className="compose-overlay"
      aria-label="つぶやきを作成"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
    >
      <button
        type="button"
        className="compose-overlay__backdrop"
        aria-label="閉じる"
        onClick={dismiss}
      />
      <section className="compose-sheet">
        <OnboardingTour steps={composeTourSteps} run={tourRun} onFinish={finishComposeTour} />
        <button
          type="button"
          className="compose-sheet__close"
          onClick={dismiss}
          aria-label="閉じる"
        >
          ×
        </button>
        <CatDisplay
          type={profile?.catType ?? "white"}
          emotion={emotion}
          className="compose-sheet__cat"
        />
        <form className="compose-form" onSubmit={submit}>
          <div className="compose-form__row">
            <label className="sr-only" htmlFor="post-body">
              つぶやき
            </label>
            <input
              id="post-body"
              autoFocus
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={30}
              placeholder="いまなにしてる？"
              autoComplete="off"
            />
            <button
              className="send-button"
              type="submit"
              disabled={loading || !currentGroup}
              aria-label="つぶやく"
            >
              <SendIcon />
            </button>
          </div>
          <fieldset className="emotion-picker">
            <legend>ねこの気分</legend>
            {emotions.map((value) => (
              <label key={value} data-selected={emotion === value}>
                <input
                  type="radio"
                  name="emotion"
                  value={value}
                  checked={emotion === value}
                  onChange={() => setEmotion(value)}
                />
                <span>{emotionLabels[value]}</span>
              </label>
            ))}
          </fieldset>
          {(validationError || error) && <ErrorState message={validationError ?? error ?? ""} />}
        </form>
      </section>
    </dialog>
  );
}
