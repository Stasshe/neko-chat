import type { User } from "@supabase/supabase-js";

import { defaultUsername } from "@/lib/profile";
import { z } from "zod";

import { getAdminClient } from "@/server/admin";
import {
  type GroupRow,
  groupReferenceRowSchema,
  groupRowSchema,
  idRowSchema,
  inviteCodeRowSchema,
  membershipRowSchema,
  type PostRow,
  type ProfileRow,
  parseData,
  postRowSchema,
  profileRowSchema,
  slotRowSchema,
} from "@/server/rows";
import {
  AppError,
  type CatType,
  type Emotion,
  type GroupSummary,
  type Post,
  type Profile,
} from "@/types/app";

type DataError = {
  code?: string;
  message: string;
};

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    catType: row.cat_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGroup(row: GroupRow, memberCount: number): GroupSummary {
  return {
    id: row.id,
    name: row.name,
    isSolo: row.is_solo,
    memberCount,
  };
}

function mapPost(row: PostRow, profile: ProfileRow): Post {
  return {
    id: row.id,
    groupId: row.group_id,
    userId: row.user_id,
    body: row.body,
    emotion: row.emotion,
    createdAt: row.created_at,
    user: {
      id: profile.id,
      username: profile.username,
      catType: profile.cat_type,
    },
  };
}

function fail(error: DataError, message: string): never {
  console.error(error);
  throw new AppError("UNKNOWN", message);
}

async function ensureProfile(user: User): Promise<ProfileRow> {
  const admin = getAdminClient();
  const existing = await admin
    .from("profiles")
    .select("id, username, cat_type, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();
  if (existing.error) {
    fail(existing.error, "プロフィールを取得できませんでした。");
  }
  if (existing.data) {
    return parseData(profileRowSchema, existing.data, "プロフィールを取得できませんでした。");
  }

  const inserted = await admin
    .from("profiles")
    .insert({ id: user.id, username: defaultUsername, cat_type: "white" })
    .select("id, username, cat_type, created_at, updated_at")
    .single();
  if (inserted.error) {
    if (inserted.error.code === "23505") {
      return ensureProfile(user);
    }
    fail(inserted.error, "プロフィールを作成できませんでした。");
  }
  return parseData(profileRowSchema, inserted.data, "プロフィールを作成できませんでした。");
}

async function getGroup(groupId: string): Promise<GroupSummary> {
  const admin = getAdminClient();
  const [groupResult, countResult] = await Promise.all([
    admin.from("groups").select("id, name, is_solo").eq("id", groupId).maybeSingle(),
    admin
      .from("group_members")
      .select("group_id", { count: "exact", head: true })
      .eq("group_id", groupId),
  ]);
  if (groupResult.error) {
    fail(groupResult.error, "グループを取得できませんでした。");
  }
  if (!groupResult.data) {
    throw new AppError("NOT_FOUND", "グループが見つかりません。");
  }
  if (countResult.error) {
    fail(countResult.error, "グループの人数を取得できませんでした。");
  }
  const group = parseData(groupRowSchema, groupResult.data, "グループを取得できませんでした。");
  const memberCount = parseData(
    z.number().int().nonnegative(),
    countResult.count ?? 0,
    "グループの人数を取得できませんでした。",
  );
  return mapGroup(group, memberCount);
}

async function requireMembership(groupId: string, userId: string): Promise<void> {
  const result = await getAdminClient()
    .from("group_members")
    .select("group_id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();
  if (result.error) {
    fail(result.error, "グループの参加状態を確認できませんでした。");
  }
  if (!result.data) {
    throw new AppError("FORBIDDEN", "このグループにはアクセスできません。");
  }
  parseData(groupReferenceRowSchema, result.data, "グループの参加状態を確認できませんでした。");
}

function createInviteCode(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const values = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

async function deleteGroup(groupId: string): Promise<void> {
  const result = await getAdminClient().from("groups").delete().eq("id", groupId);
  if (result.error) {
    console.error("Failed to roll back group creation", result.error);
  }
}

async function addInviteCode(groupId: string): Promise<string> {
  const admin = getAdminClient();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = createInviteCode();
    const result = await admin.from("invite_codes").insert({ group_id: groupId, code });
    if (!result.error) {
      return code;
    }
    if (result.error.code !== "23505") {
      fail(result.error, "招待コードを作成できませんでした。");
    }
  }
  throw new AppError("UNKNOWN", "招待コードを作成できませんでした。");
}

export async function getProfile(user: User): Promise<Profile> {
  return mapProfile(await ensureProfile(user));
}

export async function updateProfile(
  user: User,
  username: string,
  catType: CatType,
): Promise<Profile> {
  await ensureProfile(user);
  const result = await getAdminClient()
    .from("profiles")
    .update({ username, cat_type: catType, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("id, username, cat_type, created_at, updated_at")
    .single();
  if (result.error) {
    fail(result.error, "プロフィールを更新できませんでした。");
  }
  return mapProfile(
    parseData(profileRowSchema, result.data, "プロフィールを更新できませんでした。"),
  );
}

export async function getGroupInviteCode(user: User, groupId: string): Promise<string> {
  await requireMembership(groupId, user.id);
  const groupResult = await getAdminClient()
    .from("groups")
    .select("is_solo")
    .eq("id", groupId)
    .maybeSingle();
  if (groupResult.error) {
    fail(groupResult.error, "グループを取得できませんでした。");
  }
  if (!groupResult.data) {
    throw new AppError("NOT_FOUND", "グループが見つかりません。");
  }
  if (
    parseData(
      z.object({ is_solo: z.boolean() }),
      groupResult.data,
      "グループを取得できませんでした。",
    ).is_solo
  ) {
    throw new AppError("NOT_FOUND", "このグループに招待コードはありません。");
  }
  const existing = await getAdminClient()
    .from("invite_codes")
    .select("code")
    .eq("group_id", groupId)
    .maybeSingle();
  if (existing.error) {
    fail(existing.error, "招待コードを取得できませんでした。");
  }
  if (existing.data) {
    return parseData(inviteCodeRowSchema, existing.data, "招待コードを取得できませんでした。").code;
  }
  return addInviteCode(groupId);
}

export async function getGroups(user: User): Promise<GroupSummary[]> {
  await ensureProfile(user);
  const membershipResult = await getAdminClient()
    .from("group_members")
    .select("group_id, joined_at, slot")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });
  if (membershipResult.error) {
    fail(membershipResult.error, "グループ一覧を取得できませんでした。");
  }
  const memberships = parseData(
    z.array(membershipRowSchema),
    membershipResult.data,
    "グループ一覧を取得できませんでした。",
  );
  if (memberships.length === 0) {
    return [];
  }
  const groupIds = memberships.map((membership) => membership.group_id);
  const [groupsResult, membersResult] = await Promise.all([
    getAdminClient().from("groups").select("id, name, is_solo").in("id", groupIds),
    getAdminClient().from("group_members").select("group_id").in("group_id", groupIds),
  ]);
  if (groupsResult.error) {
    fail(groupsResult.error, "グループ一覧を取得できませんでした。");
  }
  if (membersResult.error) {
    fail(membersResult.error, "グループの人数を取得できませんでした。");
  }
  const groups = new Map(
    parseData(
      z.array(groupRowSchema),
      groupsResult.data,
      "グループ一覧を取得できませんでした。",
    ).map((group) => [group.id, group] as const),
  );
  const counts = new Map<string, number>();
  const members = parseData(
    z.array(groupReferenceRowSchema),
    membersResult.data,
    "グループの人数を取得できませんでした。",
  );
  for (const member of members) {
    counts.set(member.group_id, (counts.get(member.group_id) ?? 0) + 1);
  }
  return memberships.flatMap((membership) => {
    const group = groups.get(membership.group_id);
    if (!group) {
      return [];
    }
    return [mapGroup(group, counts.get(group.id) ?? 0)];
  });
}

export async function startSoloGroup(user: User): Promise<GroupSummary> {
  await ensureProfile(user);
  const admin = getAdminClient();
  const existing = await admin
    .from("groups")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_solo", true)
    .maybeSingle();
  if (existing.error) {
    fail(existing.error, "一人モードを確認できませんでした。");
  }
  let groupId = existing.data
    ? parseData(idRowSchema, existing.data, "一人モードを確認できませんでした。").id
    : undefined;
  if (!groupId) {
    const inserted = await admin
      .from("groups")
      .insert({ name: "ひとりの部屋", owner_id: user.id, is_solo: true })
      .select("id")
      .single();
    if (inserted.error) {
      if (inserted.error.code === "23505") {
        return startSoloGroup(user);
      }
      fail(inserted.error, "一人モードを開始できませんでした。");
    }
    groupId = parseData(idRowSchema, inserted.data, "一人モードを開始できませんでした。").id;
  }
  const membership = await admin
    .from("group_members")
    .upsert({ group_id: groupId, user_id: user.id, slot: 1 }, { onConflict: "group_id,user_id" });
  if (membership.error) {
    fail(membership.error, "一人モードを開始できませんでした。");
  }
  return getGroup(groupId);
}

export async function createGroup(
  user: User,
  name: string,
): Promise<{ group: GroupSummary; inviteCode: string }> {
  await ensureProfile(user);
  const admin = getAdminClient();
  const inserted = await admin
    .from("groups")
    .insert({ name, owner_id: user.id, is_solo: false })
    .select("id")
    .single();
  if (inserted.error) {
    fail(inserted.error, "グループを作成できませんでした。");
  }
  const groupId = parseData(idRowSchema, inserted.data, "グループを作成できませんでした。").id;
  const membership = await admin
    .from("group_members")
    .insert({ group_id: groupId, user_id: user.id, slot: 1 });
  if (membership.error) {
    await deleteGroup(groupId);
    fail(membership.error, "グループを作成できませんでした。");
  }
  try {
    const inviteCode = await addInviteCode(groupId);
    return { group: await getGroup(groupId), inviteCode };
  } catch (error) {
    await deleteGroup(groupId);
    throw error;
  }
}

export async function joinGroup(user: User, code: string): Promise<GroupSummary> {
  await ensureProfile(user);
  const admin = getAdminClient();
  const invitation = await admin
    .from("invite_codes")
    .select("group_id")
    .eq("code", code)
    .maybeSingle();
  if (invitation.error) {
    fail(invitation.error, "招待コードを確認できませんでした。");
  }
  const groupId = invitation.data
    ? parseData(groupReferenceRowSchema, invitation.data, "招待コードを確認できませんでした。")
        .group_id
    : undefined;
  if (!groupId) {
    throw new AppError("INVALID_INVITE_CODE", "招待コードが見つかりません。");
  }
  const existing = await admin
    .from("group_members")
    .select("group_id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing.error) {
    fail(existing.error, "グループの参加状態を確認できませんでした。");
  }
  if (existing.data) {
    parseData(groupReferenceRowSchema, existing.data, "グループの参加状態を確認できませんでした。");
    throw new AppError("ALREADY_JOINED", "このグループには参加済みです。");
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slotsResult = await admin.from("group_members").select("slot").eq("group_id", groupId);
    if (slotsResult.error) {
      fail(slotsResult.error, "グループの人数を確認できませんでした。");
    }
    const slots = parseData(
      z.array(slotRowSchema),
      slotsResult.data,
      "グループの人数を確認できませんでした。",
    );
    const occupied = new Set(slots.map((row) => row.slot));
    const slot = [1, 2, 3, 4, 5].find((candidate) => !occupied.has(candidate));
    if (!slot) {
      throw new AppError("GROUP_FULL", "このグループは5人に達しています。");
    }
    const joined = await admin
      .from("group_members")
      .insert({ group_id: groupId, user_id: user.id, slot });
    if (!joined.error) {
      return getGroup(groupId);
    }
    if (joined.error.code !== "23505") {
      fail(joined.error, "グループへ参加できませんでした。");
    }
  }
  throw new AppError("GROUP_FULL", "このグループは5人に達しています。");
}

export async function getPosts(
  user: User,
  groupId: string,
): Promise<{ group: GroupSummary; posts: Post[] }> {
  await requireMembership(groupId, user.id);
  const postsResult = await getAdminClient()
    .from("posts")
    .select("id, group_id, user_id, body, emotion, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });
  if (postsResult.error) {
    fail(postsResult.error, "投稿を取得できませんでした。");
  }
  const rows = parseData(z.array(postRowSchema), postsResult.data, "投稿を取得できませんでした。");
  const userIds = [...new Set(rows.map((row) => row.user_id))];
  let profiles = new Map<string, ProfileRow>();
  if (userIds.length > 0) {
    const profileResult = await getAdminClient()
      .from("profiles")
      .select("id, username, cat_type, created_at, updated_at")
      .in("id", userIds);
    if (profileResult.error) {
      fail(profileResult.error, "投稿者情報を取得できませんでした。");
    }
    profiles = new Map(
      parseData(
        z.array(profileRowSchema),
        profileResult.data,
        "投稿者情報を取得できませんでした。",
      ).map((profile) => [profile.id, profile] as const),
    );
  }
  const posts = rows.map((row) => {
    const profile = profiles.get(row.user_id);
    if (!profile) {
      throw new AppError("UNKNOWN", "投稿者情報を取得できませんでした。");
    }
    return mapPost(row, profile);
  });
  return { group: await getGroup(groupId), posts };
}

export async function addPost(
  user: User,
  groupId: string,
  body: string,
  emotion: Emotion,
): Promise<Post> {
  await requireMembership(groupId, user.id);
  const result = await getAdminClient()
    .from("posts")
    .insert({ group_id: groupId, user_id: user.id, body, emotion })
    .select("id, group_id, user_id, body, emotion, created_at")
    .single();
  if (result.error) {
    fail(result.error, "投稿を作成できませんでした。");
  }
  const post = parseData(postRowSchema, result.data, "投稿を作成できませんでした。");
  return mapPost(post, await ensureProfile(user));
}
