"use client";

import { type ButtonType, type EventData, EVENTS, Joyride, STATUS, type Step } from "react-joyride";

const locale = {
  back: "戻る",
  close: "閉じる",
  last: "完了",
  next: "次へ",
  skip: "スキップ",
};

const options = {
  arrowColor: "var(--paper)",
  backgroundColor: "var(--paper)",
  overlayColor: "rgba(36, 32, 31, 0.55)",
  primaryColor: "var(--accent-strong)",
  textColor: "var(--ink)",
  width: "min(320px, calc(100vw - 32px))",
  zIndex: 1000,
  showProgress: true,
  skipBeacon: true,
  buttons: ["back", "close", "primary", "skip"] satisfies ButtonType[],
};

export function OnboardingTour({
  steps,
  run,
  onFinish,
  portalElement,
}: {
  steps: Step[];
  run: boolean;
  onFinish: () => void;
  portalElement?: HTMLElement | string;
}) {
  function handleEvent(data: EventData) {
    const isTourEnd = data.type === EVENTS.TOUR_END;
    const isDone = data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED;
    if (isTourEnd && isDone) {
      onFinish();
    }
  }

  const portalProps: { portalElement?: HTMLElement | string } = {};
  if (portalElement) {
    portalProps.portalElement = portalElement;
  }

  return (
    <Joyride
      {...portalProps}
      steps={steps}
      run={run}
      continuous
      locale={locale}
      options={options}
      floatingOptions={{ strategy: "fixed", shiftOptions: { padding: 16 } }}
      onEvent={handleEvent}
    />
  );
}
