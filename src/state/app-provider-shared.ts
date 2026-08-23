import { defaultUsername } from "@/lib/profile";
import { AppError, type GroupSummary, type Post, type Profile } from "@/types/app";

export const currentGroupKey = "neko-chat.current-group";

export type OptimisticPost = Post & { pending?: boolean };

export function resolveOnboardingRedirect(profile: Profile, groups: GroupSummary[]): string | null {
  if (profile.username === defaultUsername) {
    return "/onboarding/profile";
  }
  if (groups.length === 0) {
    return "/onboarding/mode";
  }
  return null;
}

export function getErrorMessage(error: Error): string {
  if (error instanceof AppError) {
    return error.message;
  }
  console.error(error);
  return "読み込みに失敗しました。時間をおいてもう一度お試しください。";
}

export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}

export function isUnauthorized(error: Error): boolean {
  return error instanceof AppError && error.code === "UNAUTHORIZED";
}

export async function withLoading<T>(
  setLoading: (loading: boolean) => void,
  operation: () => Promise<T>,
): Promise<T> {
  setLoading(true);
  try {
    return await operation();
  } finally {
    setLoading(false);
  }
}
