import { describe, expect, it, vi } from "vitest";

import { membershipRowSchema, parseData, postRowSchema, profileRowSchema } from "./rows";

const id = "550e8400-e29b-41d4-a716-446655440000";
const timestamp = "2026-08-22T00:00:00.000Z";

describe("profileRowSchema", () => {
  it("Supabaseのsnake_case形式を受け付ける", () => {
    const result = profileRowSchema.safeParse({
      id,
      username: "neko",
      cat_type: "white",
      created_at: timestamp,
      updated_at: timestamp,
    });

    expect(result.success).toBe(true);
  });

  it("camelCase形式を拒否する", () => {
    const result = profileRowSchema.safeParse({
      id,
      username: "neko",
      catType: "white",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    expect(result.success).toBe(false);
  });
});

describe("membershipRowSchema", () => {
  it("1から5までのslotを受け付ける", () => {
    const first = membershipRowSchema.safeParse({
      group_id: id,
      joined_at: timestamp,
      slot: 1,
    });
    const fifth = membershipRowSchema.safeParse({
      group_id: id,
      joined_at: timestamp,
      slot: 5,
    });

    expect(first.success).toBe(true);
    expect(fifth.success).toBe(true);
  });

  it("範囲外のslotを拒否する", () => {
    const zero = membershipRowSchema.safeParse({
      group_id: id,
      joined_at: timestamp,
      slot: 0,
    });
    const sixth = membershipRowSchema.safeParse({
      group_id: id,
      joined_at: timestamp,
      slot: 6,
    });

    expect(zero.success).toBe(false);
    expect(sixth.success).toBe(false);
  });
});

describe("postRowSchema", () => {
  it("正しい投稿行を受け付ける", () => {
    const result = postRowSchema.safeParse({
      id,
      group_id: id,
      user_id: id,
      body: "hello",
      emotion: "neutral",
      created_at: timestamp,
    });

    expect(result.success).toBe(true);
  });
});

describe("parseData", () => {
  it("不正なDBデータをAppErrorへ変換する", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => parseData(profileRowSchema, { id: "invalid" }, "取得に失敗しました")).toThrow(
      "取得に失敗しました",
    );

    consoleSpy.mockRestore();
  });
});
