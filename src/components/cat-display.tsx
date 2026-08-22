import Image from "next/image";

import type { CatType, Emotion } from "@/types/app";

type CatDisplayProps = {
  type: CatType;
  emotion?: Emotion;
  className?: string;
};

const emotionAsset: Record<Emotion, "positive" | "neutral" | "negative"> = {
  positive: "positive",
  neutral: "neutral",
  negative: "negative",
  random: "neutral",
};

export function CatDisplay({ type, emotion = "neutral", className }: CatDisplayProps) {
  const classes = className ? `cat-display ${className}` : "cat-display";
  return (
    <span className={classes}>
      <Image
        src={`/images/cats/${type}/${emotionAsset[emotion]}.png`}
        alt={`${type} cat`}
        fill
        sizes="200px"
        className="cat-display__img"
      />
    </span>
  );
}
