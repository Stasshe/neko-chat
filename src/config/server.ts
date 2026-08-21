import { z } from "zod";

import { AppError } from "@/types/app";

const serverEnvSchema = z.object({
  supabaseUrl: z.url(),
  supabaseSecretKey: z.string().min(1),
});

export function getServerEnv(): z.infer<typeof serverEnvSchema> {
  const result = serverEnvSchema.safeParse({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
  });
  if (!result.success) {
    console.error("Server environment variables are invalid.", {
      issues: result.error.issues,
    });
    throw new AppError("CONFIGURATION_ERROR", "Supabaseのサーバー接続情報がありません。");
  }
  return result.data;
}
