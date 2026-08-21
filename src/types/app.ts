import { z } from "zod";

export const resourceIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const resourceIdSchema = z.string().regex(resourceIdPattern);

export const timestampSchema = z.iso.datetime({ offset: true });

export const inviteCodeSchema = z.string().regex(/^[A-Z0-9]{6}$/);

export const catTypeSchema = z.enum(["white", "black", "mike", "sham", "chatora"]);

export const catTypes = catTypeSchema.options;

export type CatType = z.infer<typeof catTypeSchema>;

export const emotionSchema = z.enum(["positive", "neutral", "negative", "random"]);

export const emotions = emotionSchema.options;

export type Emotion = z.infer<typeof emotionSchema>;

export const profileSchema = z.object({
  id: resourceIdSchema,
  username: z.string().min(1).max(20),
  catType: catTypeSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type Profile = z.infer<typeof profileSchema>;

export const groupSummarySchema = z.object({
  id: resourceIdSchema,
  name: z.string().min(1).max(30),
  isSolo: z.boolean(),
  memberCount: z.number().int().min(1).max(5),
});

export type GroupSummary = z.infer<typeof groupSummarySchema>;

export const postUserSchema = z.object({
  id: resourceIdSchema,
  username: z.string().min(1).max(20),
  catType: catTypeSchema,
});

export type PostUser = z.infer<typeof postUserSchema>;

export const postSchema = z.object({
  id: resourceIdSchema,
  groupId: resourceIdSchema,
  userId: resourceIdSchema,
  body: z.string().min(1).max(30),
  emotion: emotionSchema,
  createdAt: timestampSchema,
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
