import { getMyGroups } from "@/lib/api";

export type PostLoginPath = "/home" | "/onboarding/profile";

export async function getPostLoginPath(): Promise<PostLoginPath> {
  const groups = await getMyGroups();
  return groups.length === 0 ? "/onboarding/profile" : "/home";
}
