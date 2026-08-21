import { z } from "zod";

export const catTypeSchema = z.enum(["white", "black", "mike", "sham", "chatora"]);

export const catTypes = catTypeSchema.options;

export type CatType = z.infer<typeof catTypeSchema>;

export const emotionSchema = z.enum(["positive", "neutral", "negative", "random"]);

export const emotions = emotionSchema.options;

export type Emotion = z.infer<typeof emotionSchema>;

export const profileSchema = z.object({
  id: z.string(),
  username: z.string(),
  catType: catTypeSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;

export const groupSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  isSolo: z.boolean(),
  memberCount: z.number(),
});

export type GroupSummary = z.infer<typeof groupSummarySchema>;

export const postUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  catType: catTypeSchema,
});

export type PostUser = z.infer<typeof postUserSchema>;

export const postSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  userId: z.string(),
  body: z.string(),
  emotion: emotionSchema,
  createdAt: z.string(),
  user: postUserSchema,
});

export type Post = z.infer<typeof postSchema>;

export const apiErrorCodeSchema = z.enum([
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "GROUP_FULL",
  "INVALID_INVITE_CODE",
  "ALREADY_JOINED",
  "CONFIGURATION_ERROR",
  "UNKNOWN",
]);

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

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
