import { type ApiErrorCode, AppError } from "@/types/app";

const statusByCode: Record<ApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  GROUP_FULL: 409,
  INVALID_INVITE_CODE: 404,
  ALREADY_JOINED: 409,
  CONFIGURATION_ERROR: 500,
  UNKNOWN: 500,
};

export function success<T>(data: T, status = 200): Response {
  return Response.json({ ok: true, data }, { status });
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new AppError("VALIDATION_ERROR", "JSON形式のリクエスト本文が必要です。");
  }
}

export function failure(error: object): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        ok: false,
        error: { code: error.code, message: error.message },
      },
      { status: statusByCode[error.code] },
    );
  }

  console.error(error);
  return Response.json(
    {
      ok: false,
      error: { code: "UNKNOWN", message: "サーバー処理に失敗しました。" },
    },
    { status: 500 },
  );
}
