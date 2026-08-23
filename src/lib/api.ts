import { z } from "zod";

import { getSupabaseClient } from "@/lib/supabase/client";
import {
  AppError,
  apiErrorCodeSchema,
  type CatType,
  type Emotion,
  type GroupSummary,
  groupSummarySchema,
  inviteCodeSchema,
  type Post,
  type Profile,
  postSchema,
  profileSchema,
} from "@/types/app";

const apiFailureSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
  }),
});

function createApiResultSchema<T>(dataSchema: z.ZodType<T>) {
  return z.discriminatedUnion("ok", [
    z.object({ ok: z.literal(true), data: dataSchema }),
    apiFailureSchema,
  ]);
}

async function readResponse<T>(response: Response, dataSchema: z.ZodType<T>): Promise<T> {
  let result: unknown;
  try {
    result = await response.json();
  } catch (error) {
    console.error("API response was not valid JSON.", error);
    throw new AppError("UNKNOWN", "サーバーから不正な応答を受信しました。");
  }

  const parsed = createApiResultSchema(dataSchema).safeParse(result);
  if (!parsed.success) {
    console.error("API response did not match the expected format.", {
      status: response.status,
      issues: parsed.error.issues,
    });
    throw new AppError("UNKNOWN", "サーバーから不正な応答を受信しました。");
  }
  if (!parsed.data.ok) {
    throw new AppError(parsed.data.error.code, parsed.data.error.message);
  }
  if (!response.ok) {
    console.error("API returned a success body with an error status.", {
      status: response.status,
    });
    throw new AppError("UNKNOWN", "サーバーから不正な応答を受信しました。");
  }
  return parsed.data.data;
}

async function getAccessToken(forceRefresh: boolean): Promise<string> {
  const client = getSupabaseClient();
  if (!client) {
    throw new AppError("CONFIGURATION_ERROR", "Supabase Authの接続情報が設定されていません。");
  }
  if (forceRefresh) {
    const { data, error } = await client.auth.refreshSession();
    if (error || !data.session) {
      throw new AppError("UNAUTHORIZED", "ログイン状態を確認してください。");
    }
    return data.session.access_token;
  }
  const { data, error } = await client.auth.getSession();
  if (error || !data.session) {
    throw new AppError("UNAUTHORIZED", "ログイン状態を確認してください。");
  }
  return data.session.access_token;
}

async function fetchWithToken(
  path: string,
  init: RequestInit | undefined,
  forceRefresh: boolean,
): Promise<Response> {
  const accessToken = await getAccessToken(forceRefresh);
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  if (init?.body) {
    headers.set("Content-Type", "application/json");
  }
  try {
    return await fetch(path, { ...init, headers });
  } catch (error) {
    console.error(error);
    throw new AppError("UNKNOWN", "サーバーへ接続できませんでした。");
  }
}

async function request<T>(path: string, dataSchema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  let response = await fetchWithToken(path, init, false);
  if (response.status === 401) {
    // Access token may have expired without the client noticing yet; refresh and retry once
    // before treating it as a real sign-out. Without this, a stale-but-recoverable token bounces
    // the user between "/" and "/home" forever since the session never gets a chance to renew.
    response = await fetchWithToken(path, init, true);
  }
  return readResponse(response, dataSchema);
}

export async function getMyProfile(): Promise<Profile> {
  const data = await request("/api/profile", z.object({ profile: profileSchema }));
  return data.profile;
}

export async function updateMyProfile(username: string, catType: CatType): Promise<Profile> {
  const data = await request("/api/profile", z.object({ profile: profileSchema }), {
    method: "PATCH",
    body: JSON.stringify({ username, catType }),
  });
  return data.profile;
}

export async function getMyGroups(): Promise<GroupSummary[]> {
  const data = await request("/api/groups", z.object({ groups: z.array(groupSummarySchema) }));
  return data.groups;
}

export async function startSoloMode(): Promise<GroupSummary> {
  const data = await request("/api/groups", z.object({ group: groupSummarySchema }), {
    method: "POST",
    body: JSON.stringify({ mode: "solo" }),
  });
  return data.group;
}

export async function createGroupWithInvite(
  name: string,
): Promise<{ group: GroupSummary; inviteCode: string }> {
  return request(
    "/api/groups",
    z.object({ group: groupSummarySchema, inviteCode: inviteCodeSchema }),
    {
      method: "POST",
      body: JSON.stringify({ mode: "create", name }),
    },
  );
}

export async function joinGroupByInviteCode(code: string): Promise<GroupSummary> {
  const data = await request("/api/groups/join", z.object({ group: groupSummarySchema }), {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  return data.group;
}

export async function getGroupInviteCode(groupId: string): Promise<string> {
  const data = await request(
    `/api/groups/${groupId}/invite`,
    z.object({ inviteCode: inviteCodeSchema }),
  );
  return data.inviteCode;
}

export async function getGroupPosts(groupId: string): Promise<Post[]> {
  const data = await request(
    `/api/groups/${groupId}/posts`,
    z.object({ group: groupSummarySchema, posts: z.array(postSchema) }),
  );
  return data.posts;
}

export async function createPost(groupId: string, body: string, emotion: Emotion): Promise<Post> {
  const data = await request(`/api/groups/${groupId}/posts`, z.object({ post: postSchema }), {
    method: "POST",
    body: JSON.stringify({ body, emotion }),
  });
  return data.post;
}
