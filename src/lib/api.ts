import { getSupabaseClient } from "@/lib/supabase/client";
import {
  AppError,
  type CatType,
  type Emotion,
  type GroupSummary,
  type Post,
  type Profile,
} from "@/types/app";

type ApiFailure = {
  ok: false;
  error: {
    code: AppError["code"];
    message: string;
  };
};

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

async function getAccessToken(): Promise<string> {
  const client = getSupabaseClient();
  if (!client) {
    throw new AppError("CONFIGURATION_ERROR", "Supabase Authの接続情報が設定されていません。");
  }
  const { data, error } = await client.auth.getSession();
  if (error || !data.session) {
    throw new AppError("UNAUTHORIZED", "ログイン状態を確認してください。");
  }
  return data.session.access_token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = await getAccessToken();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  if (init?.body) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(path, { ...init, headers });
  } catch (error) {
    console.error(error);
    throw new AppError("UNKNOWN", "サーバーへ接続できませんでした。");
  }

  const result = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!result.ok) {
    throw new AppError(result.error.code, result.error.message);
  }
  return result.data;
}

export async function getMyProfile(): Promise<Profile> {
  const data = await request<{ profile: Profile }>("/api/profile");
  return data.profile;
}

export async function updateMyProfile(username: string, catType: CatType): Promise<Profile> {
  const data = await request<{ profile: Profile }>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify({ username, catType }),
  });
  return data.profile;
}

export async function getMyGroups(): Promise<GroupSummary[]> {
  const data = await request<{ groups: GroupSummary[] }>("/api/groups");
  return data.groups;
}

export async function startSoloMode(): Promise<GroupSummary> {
  const data = await request<{ group: GroupSummary }>("/api/groups", {
    method: "POST",
    body: JSON.stringify({ mode: "solo" }),
  });
  return data.group;
}

export async function createGroupWithInvite(
  name: string,
): Promise<{ group: GroupSummary; inviteCode: string }> {
  return request("/api/groups", {
    method: "POST",
    body: JSON.stringify({ mode: "create", name }),
  });
}

export async function joinGroupByInviteCode(code: string): Promise<GroupSummary> {
  const data = await request<{ group: GroupSummary }>("/api/groups/join", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  return data.group;
}

export async function getGroupPosts(groupId: string): Promise<Post[]> {
  const data = await request<{ group: GroupSummary; posts: Post[] }>(
    `/api/groups/${groupId}/posts`,
  );
  return data.posts;
}

export async function createPost(groupId: string, body: string, emotion: Emotion): Promise<Post> {
  const data = await request<{ post: Post }>(`/api/groups/${groupId}/posts`, {
    method: "POST",
    body: JSON.stringify({ body, emotion }),
  });
  return data.post;
}
