import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/supabase/client";
import {
  AppError,
  type CatType,
  catTypes,
  type Emotion,
  emotions,
  type GroupSummary,
  type Post,
  type Profile,
} from "@/types/app";

type RawProfile = {
  id: string;
  username: string;
  catType?: string;
  cat_type?: string;
  avatar_type?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
};

type RawGroup = {
  id: string;
  name: string;
  isSolo?: boolean;
  is_solo?: boolean;
  memberCount?: number;
  member_count?: number;
};

type RawPostUser = {
  id: string;
  username: string;
  catType?: string;
  cat_type?: string;
  avatar_type?: string;
};

type RawPost = {
  id: string;
  groupId?: string;
  group_id?: string;
  userId?: string;
  user_id?: string;
  body?: string;
  content?: string;
  emotion?: string;
  cat_expression?: string;
  createdAt?: string;
  created_at?: string;
  user?: RawPostUser;
};

function requireClient() {
  const client = getSupabaseClient();
  if (!client) {
    throw new AppError(
      "CONFIGURATION_ERROR",
      "Supabase の接続情報が設定されていません。環境変数を確認してください。",
    );
  }
  return client;
}

function isCatType(value: string): value is CatType {
  return catTypes.includes(value as CatType);
}

function normalizeCatType(value?: string): CatType {
  if (value && isCatType(value)) {
    return value;
  }
  return "white";
}

function normalizeEmotion(value?: string): Emotion {
  if (value && emotions.includes(value as Emotion)) {
    return value as Emotion;
  }
  return "neutral";
}

function mapError(error: PostgrestError): AppError {
  const message = error.message.toLowerCase();
  if (message.includes("unauthorized") || error.code === "42501") {
    return new AppError("UNAUTHORIZED", "ログイン状態を確認してください。");
  }
  if (message.includes("group is full")) {
    return new AppError("GROUP_FULL", "このグループは5人に達しています。");
  }
  if (message.includes("invite code")) {
    return new AppError("INVALID_INVITE_CODE", "招待コードが見つかりません。");
  }
  if (message.includes("between") || message.includes("invalid")) {
    return new AppError("VALIDATION_ERROR", "入力内容を確認してください。");
  }
  return new AppError("UNKNOWN", error.message);
}

function mapProfile(raw: RawProfile): Profile {
  return {
    id: raw.id,
    username: raw.username,
    catType: normalizeCatType(raw.catType ?? raw.cat_type ?? raw.avatar_type),
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    updatedAt: raw.updatedAt ?? raw.updated_at ?? "",
  };
}

function mapGroup(raw: RawGroup): GroupSummary {
  return {
    id: raw.id,
    name: raw.name,
    isSolo: raw.isSolo ?? raw.is_solo ?? false,
    memberCount: raw.memberCount ?? raw.member_count ?? 1,
  };
}

function mapPost(raw: RawPost): Post {
  const rawUser = raw.user;
  if (!rawUser) {
    throw new AppError("UNKNOWN", "投稿者情報を取得できませんでした。");
  }
  return {
    id: raw.id,
    groupId: raw.groupId ?? raw.group_id ?? "",
    userId: raw.userId ?? raw.user_id ?? rawUser.id,
    body: raw.body ?? raw.content ?? "",
    emotion: normalizeEmotion(raw.emotion ?? raw.cat_expression),
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    user: {
      id: rawUser.id,
      username: rawUser.username,
      catType: normalizeCatType(rawUser.catType ?? rawUser.cat_type ?? rawUser.avatar_type),
    },
  };
}

function unwrapProfile(response: { profile?: RawProfile } | RawProfile): RawProfile {
  if ("id" in response) {
    return response;
  }
  if (response.profile) {
    return response.profile;
  }
  throw new AppError("UNKNOWN", "プロフィールを取得できませんでした。");
}

function unwrapPost(response: { post?: RawPost } | RawPost): RawPost {
  if ("id" in response) {
    return response;
  }
  if (response.post) {
    return response.post;
  }
  throw new AppError("UNKNOWN", "投稿結果を取得できませんでした。");
}

export async function getMyProfile(): Promise<Profile> {
  const { data, error } = await requireClient().rpc("get_my_profile");
  if (error) {
    throw mapError(error);
  }
  const response = data as { profile?: RawProfile } | RawProfile;
  return mapProfile(unwrapProfile(response));
}

export async function updateMyProfile(username: string, catType: CatType): Promise<Profile> {
  const { data, error } = await requireClient().rpc("update_my_profile", {
    p_username: username,
    p_cat_type: catType,
  });
  if (error) {
    throw mapError(error);
  }
  const response = data as { profile?: RawProfile } | RawProfile;
  return mapProfile(unwrapProfile(response));
}

export async function getMyGroups(): Promise<GroupSummary[]> {
  const { data, error } = await requireClient().rpc("get_my_groups");
  if (error) {
    throw mapError(error);
  }
  const response = data as { groups?: RawGroup[] } | RawGroup[];
  let groups: RawGroup[] = [];
  if (Array.isArray(response)) {
    groups = response;
  } else if (response.groups) {
    groups = response.groups;
  }
  return groups.map(mapGroup);
}

export async function getGroupPosts(groupId: string): Promise<Post[]> {
  const { data, error } = await requireClient().rpc("get_group_posts", {
    p_group_id: groupId,
  });
  if (error) {
    throw mapError(error);
  }
  const response = data as { posts?: RawPost[] };
  return (response.posts ?? []).map(mapPost);
}

export async function createPost(groupId: string, body: string, emotion: Emotion): Promise<Post> {
  const { data, error } = await requireClient().rpc("create_post", {
    p_group_id: groupId,
    p_body: body,
    p_emotion: emotion,
  });
  if (error) {
    throw mapError(error);
  }
  const response = data as { post?: RawPost } | RawPost;
  return mapPost(unwrapPost(response));
}
