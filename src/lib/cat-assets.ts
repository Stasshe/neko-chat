import type { CatType, Emotion } from "@/types/app";

const catImagePaths: Record<
  CatType,
  {
    positive: string;
    neutral: string;
    negative: string;
  }
> = {
  white: {
    positive: "/images/cats/white/positive.png",
    neutral: "/images/cats/white/neutral.png",
    negative: "/images/cats/white/negative.png",
  },
  black: {
    positive: "/images/cats/black/positive.png",
    neutral: "/images/cats/black/neutral.png",
    negative: "/images/cats/black/negative.png",
  },
  mike: {
    positive: "/images/cats/mike/positive.png",
    neutral: "/images/cats/mike/neutral.png",
    negative: "/images/cats/mike/negative.png",
  },
  sham: {
    positive: "/images/cats/sham/positive.png",
    neutral: "/images/cats/sham/neutral.png",
    negative: "/images/cats/sham/negative.png",
  },
  chatora: {
    positive: "/images/cats/chatora/positive.png",
    neutral: "/images/cats/chatora/neutral.png",
    negative: "/images/cats/chatora/negative.png",
  },
};

type CatPose = "sit" | "stand" | "lie";
export type ConcreteEmotion = Exclude<Emotion, "random">;

const concreteEmotions = ["positive", "neutral", "negative"] as const;

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
  return catImagePaths[type][normalizedEmotion];
}
