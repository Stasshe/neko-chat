import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { AppError } from "@/types/app";

import { failure, parseValue, readJson, success } from "./http";

const inputSchema = z.object({
  name: z.string().min(1),
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("success", () => {
  it("成功レスポンスを指定したstatusで返す", async () => {
    const response = success({ id: "123" }, 201);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: { id: "123" },
    });
  });
});

describe("parseValue", () => {
  it("正しい値を返す", () => {
    const result = parseValue(inputSchema, {
      name: "neko",
    });

    expect(result).toEqual({
      name: "neko",
    });
  });

  it("不正な値をVALIDATION_ERRORへ変換する", () => {
    expect(() => parseValue(inputSchema, { name: "" })).toThrow(AppError);

    try {
      parseValue(inputSchema, { name: "" });
    } catch (error) {
      expect(error).toMatchObject({
        code: "VALIDATION_ERROR",
      });
    }
  });
});

describe("readJson", () => {
  it("JSONリクエストを解析する", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: "neko",
      }),
    });

    await expect(readJson(request, inputSchema)).resolves.toEqual({
      name: "neko",
    });
  });

  it("壊れたJSONをVALIDATION_ERRORへ変換する", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: "{",
    });

    await expect(readJson(request, inputSchema)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });
});

describe("failure", () => {
  it("AppErrorを対応するHTTP statusへ変換する", async () => {
    const response = failure(new AppError("NOT_FOUND", "見つかりません"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "見つかりません",
      },
    });
  });

  it("不明なエラーを500へ変換する", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = failure(new Error("unexpected"));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "UNKNOWN",
      },
    });
  });
});
