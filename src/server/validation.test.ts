import { describe, expect, it } from "vitest";

import {
  groupNameSchema,
  joinInputSchema,
  postInputSchema,
  profileInputSchema,
} from "./validation";

describe("profileInputSchema", () => {
  it("正しいプロフィール入力を受け付け、名前の空白を除去する", () => {
    const result = profileInputSchema.parse({
      username: "  neko  ",
      catType: "white",
    });

    expect(result).toEqual({
      username: "neko",
      catType: "white",
    });
  });

  it("空のユーザー名を拒否する", () => {
    const result = profileInputSchema.safeParse({
      username: "   ",
      catType: "white",
    });

    expect(result.success).toBe(false);
  });

  it("存在しない猫タイプを拒否する", () => {
    const result = profileInputSchema.safeParse({
      username: "neko",
      catType: "unknown",
    });

    expect(result.success).toBe(false);
  });
});

describe("groupNameSchema", () => {
  it("30文字を超えるグループ名を拒否する", () => {
    const result = groupNameSchema.safeParse("a".repeat(31));

    expect(result.success).toBe(false);
  });
});

describe("joinInputSchema", () => {
  it("招待コードを大文字へ変換する", () => {
    const result = joinInputSchema.parse({
      code: "ab12cd",
    });

    expect(result.code).toBe("AB12CD");
  });

  it("6文字ではない招待コードを拒否する", () => {
    const result = joinInputSchema.safeParse({
      code: "ABC12",
    });

    expect(result.success).toBe(false);
  });
});

describe("postInputSchema", () => {
  it("正しい投稿入力を受け付ける", () => {
    const result = postInputSchema.parse({
      body: "  hello  ",
      emotion: "positive",
    });

    expect(result).toEqual({
      body: "hello",
      emotion: "positive",
    });
  });

  it("30文字を超える本文を拒否する", () => {
    const result = postInputSchema.safeParse({
      body: "a".repeat(31),
      emotion: "positive",
    });

    expect(result.success).toBe(false);
  });

  it("存在しないemotionを拒否する", () => {
    const result = postInputSchema.safeParse({
      body: "hello",
      emotion: "unknown",
    });

    expect(result.success).toBe(false);
  });
});
