import type { CatType, Emotion } from "@/types/app";

type CatPose = "sit" | "stand" | "lie";
export type ConcreteEmotion = Exclude<Emotion, "random">;

const concreteEmotions = ["positive", "neutral", "negative"] as const;
const poseFileNames: Record<CatPose, string> = {
  sit: "shit",
  stand: "normal",
  lie: "ne",
};
const emotionFileNames: Record<ConcreteEmotion, string> = {
  positive: "posi",
  neutral: "soso",
  negative: "nega",
};

function pickEmotionFromSeed(seed: string): ConcreteEmotion {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return concreteEmotions[hash % concreteEmotions.length] ?? "neutral";
}

export function resolveEmotion(emotion: Emotion, randomValue = Math.random()): ConcreteEmotion {
  if (emotion !== "random") {
    return emotion;
  }

  return concreteEmotions[Math.floor(randomValue * concreteEmotions.length)] ?? "neutral";
}

function normalizeEmotion(
  emotion: Emotion | undefined,
  pose: CatPose,
  seed?: string,
): ConcreteEmotion {
  if (!emotion) {
    if (pose === "lie") {
      return "positive";
    }

    if (pose === "sit") {
      return "negative";
    }

    return "neutral";
  }

  if (emotion !== "random") {
    return emotion;
  }

  if (seed) {
    return pickEmotionFromSeed(seed);
  }

  return "neutral";
}

export function getCatImageSrc(
  type: CatType,
  emotion: Emotion | undefined,
  pose: CatPose,
  seed?: string,
): string {
  const normalizedEmotion = normalizeEmotion(emotion, pose, seed ?? `${type}:${pose}`);
  return `/images/cats/${type}/${type}_${poseFileNames[pose]}_${emotionFileNames[normalizedEmotion]}.png`;
}
