import { z } from "zod";

const publicEnvSchema = z.object({
  supabaseUrl: z.url(),
  supabasePublishableKey: z.string().min(1),
});

export function getPublicEnv(): z.infer<typeof publicEnvSchema> | null {
  const result = publicEnvSchema.safeParse({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  if (!result.success) {
    console.error("Public environment variables are invalid.", {
      issues: result.error.issues,
    });
    return null;
  }
  return result.data;
}
