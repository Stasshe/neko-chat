import { z } from "zod";

import { catTypes, emotions, resourceIdPattern } from "@/types/app";

const usernameMessage = "名前は1〜20文字で入力してください。";
const groupNameMessage = "グループ名は1〜30文字で入力してください。";
const inviteCodeMessage = "招待コードは英数字6文字で入力してください。";
const postBodyMessage = "つぶやきは1〜30文字で入力してください。";

export const idSchema = z
  .string({ error: "IDの形式が正しくありません。" })
  .regex(resourceIdPattern, "IDの形式が正しくありません。");

export const profileInputSchema = z.object({
  username: z
    .string({ error: usernameMessage })
    .trim()
    .min(1, usernameMessage)
    .max(20, usernameMessage),
  catType: z.enum(catTypes, { error: "猫の種類が正しくありません。" }),
});

export const groupInputSchema = z.object({
  mode: z.enum(["solo", "create"], {
    error: "グループ作成モードが正しくありません。",
  }),
  name: z.unknown().optional(),
});

export const groupNameSchema = z
  .string({ error: groupNameMessage })
  .trim()
  .min(1, groupNameMessage)
  .max(30, groupNameMessage);

export const joinInputSchema = z.object({
  code: z
    .string({ error: inviteCodeMessage })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6}$/, inviteCodeMessage),
});

export const postInputSchema = z.object({
  body: z
    .string({ error: postBodyMessage })
    .trim()
    .min(1, postBodyMessage)
    .max(30, postBodyMessage),
  emotion: z.enum(emotions, { error: "猫の表情が正しくありません。" }),
});
