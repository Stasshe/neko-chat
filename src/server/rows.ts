import { z } from "zod";

import {
  AppError,
  catTypeSchema,
  emotionSchema,
  resourceIdSchema,
  timestampSchema,
} from "@/types/app";

export const profileRowSchema = z.object({
  id: resourceIdSchema,
  username: z.string().min(1).max(20),
  cat_type: catTypeSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export type ProfileRow = z.infer<typeof profileRowSchema>;

export const groupRowSchema = z.object({
  id: resourceIdSchema,
  name: z.string().min(1).max(30),
  is_solo: z.boolean(),
});

export type GroupRow = z.infer<typeof groupRowSchema>;

export const membershipRowSchema = z.object({
  group_id: resourceIdSchema,
  joined_at: timestampSchema,
  slot: z.number().int().min(1).max(5),
});

export type MembershipRow = z.infer<typeof membershipRowSchema>;

export const groupReferenceRowSchema = z.object({
  group_id: resourceIdSchema,
});

export const idRowSchema = z.object({
  id: resourceIdSchema,
});

export const slotRowSchema = z.object({
  slot: z.number().int().min(1).max(5),
});

export const postRowSchema = z.object({
  id: resourceIdSchema,
  group_id: resourceIdSchema,
  user_id: resourceIdSchema,
  body: z.string().min(1).max(30),
  emotion: emotionSchema,
  created_at: timestampSchema,
});

export type PostRow = z.infer<typeof postRowSchema>;

export function parseData<T>(schema: z.ZodType<T>, data: unknown, message: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("Supabase response did not match the expected format.", {
      issues: result.error.issues,
    });
    throw new AppError("UNKNOWN", message);
  }
  return result.data;
}
