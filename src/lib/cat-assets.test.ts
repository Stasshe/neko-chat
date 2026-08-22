import { describe, expect, it } from "vitest";

import { getCatImageSrc, resolveEmotion } from "./cat-assets";

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
    expect(first).toMatch(/^\/images\/cats\/white\/(positive|neutral|negative)\.png$/);
  });
});
