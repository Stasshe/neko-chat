export const catTypes = ["white", "black", "mike", "sham", "chatora"] as const;

export type CatType = (typeof catTypes)[number];

export const emotions = ["positive", "neutral", "negative", "random"] as const;

export type Emotion = (typeof emotions)[number];

export type Profile = {
  id: string;
  username: string;
  catType: CatType;
  createdAt: string;
  updatedAt: string;
};

export type GroupSummary = {
  id: string;
  name: string;
  isSolo: boolean;
  memberCount: number;
};

export type PostUser = {
  id: string;
  username: string;
  catType: CatType;
};

export type Post = {
  id: string;
  groupId: string;
  userId: string;
  body: string;
  emotion: Emotion;
  createdAt: string;
  user: PostUser;
};

export const apiErrorCodes = [
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "GROUP_FULL",
  "INVALID_INVITE_CODE",
  "ALREADY_JOINED",
  "CONFIGURATION_ERROR",
  "UNKNOWN",
] as const;

export type ApiErrorCode = (typeof apiErrorCodes)[number];

export class AppError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export type OnboardingDraft = {
  username: string;
  selectedMode: "solo" | "create_group" | "join_group" | null;
  catType: CatType | null;
  groupName: string;
  inviteCode: string;
};
