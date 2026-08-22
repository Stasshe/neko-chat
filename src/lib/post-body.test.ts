import { describe, expect, it } from "vitest";

import { CAT_POST_SUFFIX, formatPostBody } from "./post-body";

describe("formatPostBody", () => {
  it("投稿本文の末尾にニャーを追加する", () => {
    expect(formatPostBody("今日は楽しかった")).toBe("今日は楽しかったニャー");
  });

  it("30文字の本文にも文字数制限とは別にニャーを追加する", () => {
    const body = "あ".repeat(30);
    const formatted = formatPostBody(body);

    expect(body).toHaveLength(30);
    expect(formatted).toBe(`${body}${CAT_POST_SUFFIX}`);
    expect(formatted).toHaveLength(33);
  });
});
