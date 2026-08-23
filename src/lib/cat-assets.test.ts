import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { catTypes } from "@/types/app";

import { getCatImageSrc, resolveEmotion } from "./cat-assets";

const poses = ["sit", "stand", "lie"] as const;
const concreteEmotions = ["positive", "neutral", "negative"] as const;

describe("cat assets", () => {
  it("randomを具体的な表情へ解決する", () => {
    expect(resolveEmotion("random", 0)).toBe("positive");
    expect(resolveEmotion("random", 0.34)).toBe("neutral");
    expect(resolveEmotion("random", 0.67)).toBe("negative");
  });

  it("具体的な表情はそのまま返す", () => {
    expect(resolveEmotion("positive", 0)).toBe("positive");
    expect(resolveEmotion("neutral", 0.99)).toBe("neutral");
    expect(resolveEmotion("negative", 0.5)).toBe("negative");
  });

  it("既存のrandom投稿はseedから安定して画像を選ぶ", () => {
    const first = getCatImageSrc("white", "random", "sit", "post-1");
    const second = getCatImageSrc("white", "random", "sit", "post-1");

    expect(first).toBe(second);
    expect(first).toMatch(/^\/images\/cats\/white\/white_shit_(posi|soso|nega)\.png$/);
  });

  it("猫種・姿勢・表情に対応する画像パスを返す", () => {
    expect(getCatImageSrc("white", "positive", "sit")).toBe(
      "/images/cats/white/white_shit_posi.png",
    );
    expect(getCatImageSrc("black", "neutral", "stand")).toBe(
      "/images/cats/black/black_normal_soso.png",
    );
    expect(getCatImageSrc("chatora", "negative", "lie")).toBe(
      "/images/cats/chatora/chatora_ne_nega.png",
    );
  });

  it("全猫種の姿勢・表情画像が揃っている", () => {
    for (const type of catTypes) {
      for (const pose of poses) {
        for (const emotion of concreteEmotions) {
          const src = getCatImageSrc(type, emotion, pose);
          expect(existsSync(join(process.cwd(), "public", src.slice(1))), src).toBe(true);
        }
      }
    }
  });
});
