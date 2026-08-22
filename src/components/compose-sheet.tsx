"use client";

import { AnimatePresence, domAnimation, LazyMotion, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
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

type ComposeDialogProps = {
  body: string;
  emotion: Emotion;
  validationError: string | null;
  onBodyChange: (body: string) => void;
  onEmotionChange: (emotion: Emotion) => void;
  onValidationError: (message: string | null) => void;
};

function ComposeDialog({
  body,
  emotion,
  validationError,
  onBodyChange,
  onEmotionChange,
  onValidationError,
}: ComposeDialogProps) {
  const { profile, currentGroup, closeCompose, loading, error, publishPost } = useApp();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const tourStage = useTourStage();
  const reducedMotion = useReducedMotion();
  const [tourReady, setTourReady] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog?.isConnected) {
      return;
    }
    const previouslyFocused = document.activeElement;

    dialog.showModal();
    dialog.focus();

    return () => {
      if (dialog.open) {
        dialog.close();
      }
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, []);

  function finishComposeTour() {
    setTourStage("done");
  }

  function dismiss() {
    closeCompose();
  }

  function finishEntryAnimation() {
    if (tourStage === "compose") {
      setTourReady(true);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || trimmed.length > 30) {
      onValidationError("つぶやきは1〜30文字で入力してください。");
      return;
    }
    onValidationError(null);
    try {
      await publishPost(trimmed, emotion);
      onBodyChange("");
      onEmotionChange("neutral");
      dismiss();
    } catch {
      // The provider exposes the actionable error message.
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="compose-overlay"
      aria-label="つぶやきを作成"
      tabIndex={-1}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
    >
      <m.button
        type="button"
        className="compose-overlay__backdrop"
        aria-label="閉じる"
        tabIndex={-1}
        onClick={dismiss}
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.18 }}
      />
      <m.section
        className="compose-sheet"
        initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.99 }}
        transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={finishEntryAnimation}
      >
        <OnboardingTour
          steps={composeTourSteps}
          run={tourReady && tourStage === "compose"}
          onFinish={finishComposeTour}
          portalElement=".compose-tour-portal"
        />
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
              value={body}
              onChange={(event) => onBodyChange(event.target.value)}
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
                  onChange={() => onEmotionChange(value)}
                />
                <span>{emotionLabels[value]}</span>
              </label>
            ))}
          </fieldset>
          {(validationError || error) && <ErrorState message={validationError ?? error ?? ""} />}
        </form>
      </m.section>
      <div className="compose-tour-portal" />
    </dialog>
  );
}

export function ComposeSheet() {
  const { composeOpen } = useApp();
  const [body, setBody] = useState("");
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const [validationError, setValidationError] = useState<string | null>(null);

  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence>
        {composeOpen && (
          <ComposeDialog
            key="compose-dialog"
            body={body}
            emotion={emotion}
            validationError={validationError}
            onBodyChange={setBody}
            onEmotionChange={setEmotion}
            onValidationError={setValidationError}
          />
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
