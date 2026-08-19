import { AppError, type CatType, catTypes, type Emotion, emotions } from "@/types/app";

export function readUsername(value: string): string {
  const username = value.trim();
  if (username.length < 1 || username.length > 20) {
    throw new AppError("VALIDATION_ERROR", "名前は1〜20文字で入力してください。");
  }
  return username;
}

export function readCatType(value: string): CatType {
  if (!catTypes.includes(value as CatType)) {
    throw new AppError("VALIDATION_ERROR", "猫の種類が正しくありません。");
  }
  return value as CatType;
}

export function readGroupName(value: string): string {
  const name = value.trim();
  if (name.length < 1 || name.length > 30) {
    throw new AppError("VALIDATION_ERROR", "グループ名は1〜30文字で入力してください。");
  }
  return name;
}

export function readInviteCode(value: string): string {
  const code = value.trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    throw new AppError("VALIDATION_ERROR", "招待コードは英数字6文字で入力してください。");
  }
  return code;
}

export function readId(value: string): string {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuid.test(value)) {
    throw new AppError("VALIDATION_ERROR", "IDの形式が正しくありません。");
  }
  return value;
}

export function readPostBody(value: string): string {
  const body = value.trim();
  if (body.length < 1 || body.length > 30) {
    throw new AppError("VALIDATION_ERROR", "つぶやきは1〜30文字で入力してください。");
  }
  return body;
}

export function readEmotion(value: string): Emotion {
  if (!emotions.includes(value as Emotion)) {
    throw new AppError("VALIDATION_ERROR", "猫の表情が正しくありません。");
  }
  return value as Emotion;
}
