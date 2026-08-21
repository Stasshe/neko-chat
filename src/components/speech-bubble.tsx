import type { ReactNode } from "react";

export function SpeechBubble({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return <div className={`speech-bubble speech-bubble--${align}`}>{children}</div>;
}
