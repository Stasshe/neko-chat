import { describe, expect, it } from "vitest";

import {
  AppError,
  groupSummarySchema,
  inviteCodeSchema,
  postSchema,
  resourceIdSchema,
  timestampSchema,
} from "./app";

const id = "550e8400-e29b-41d4-a716-446655440000";
const timestamp = "2026-08-22T00:00:00.000Z";

describe("共通スキーマ", () => {
  it("正しいUUIDを受け付ける", () => {
    expect(resourceIdSchema.safeParse(id).success).toBe(true);
  });

  it("不正なUUIDを拒否する", () => {
    expect(resourceIdSchema.safeParse("not-a-uuid").success).toBe(false);
  });

  it("ISO形式の日時を受け付ける", () => {
    expect(timestampSchema.safeParse(timestamp).success).toBe(true);
  });

  it("招待コードは大文字英数字6文字だけ受け付ける", () => {
    expect(inviteCodeSchema.safeParse("AB12CD").success).toBe(true);
    expect(inviteCodeSchema.safeParse("ab12cd").success).toBe(false);
  });
});

describe("groupSummarySchema", () => {
  it("1人から5人までのグループを受け付ける", () => {
    const result = groupSummarySchema.safeParse({
      id,
      name: "neko group",
      isSolo: false,
      memberCount: 5,
    });

    expect(result.success).toBe(true);
  });

  it("6人以上のグループを拒否する", () => {
    const result = groupSummarySchema.safeParse({
      id,
      name: "neko group",
      isSolo: false,
      memberCount: 6,
    });

    expect(result.success).toBe(false);
  });
});

describe("postSchema", () => {
  it("正しい投稿データを受け付ける", () => {
    const result = postSchema.safeParse({
      id,
      groupId: id,
      userId: id,
      body: "hello",
      emotion: "positive",
      createdAt: timestamp,
      user: {
        id,
        username: "neko",
        catType: "white",
      },
    });

    expect(result.success).toBe(true);
  });

  it("30文字を超える投稿本文を拒否する", () => {
    const result = postSchema.safeParse({
      id,
      groupId: id,
      userId: id,
      body: "a".repeat(31),
      emotion: "positive",
      createdAt: timestamp,
      user: {
        id,
        username: "neko",
        catType: "white",
      },
    });

    expect(result.success).toBe(false);
  });
});

describe("AppError", () => {
  it("エラーコードとメッセージを保持する", () => {
    const error = new AppError("NOT_FOUND", "見つかりません");

    expect(error.name).toBe("AppError");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("見つかりません");
  });
});
