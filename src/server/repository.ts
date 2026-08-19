import type { User } from "@supabase/supabase-js";
import type { Sql, TransactionSql } from "postgres";

import { getDatabase } from "@/server/db";
import {
  AppError,
  type CatType,
  type Emotion,
  type GroupSummary,
  type Post,
  type Profile,
} from "@/types/app";

type ProfileRow = {
  id: string;
  username: string;
  cat_type: CatType;
  created_at: Date;
  updated_at: Date;
};

type GroupRow = {
  id: string;
  name: string;
  is_solo: boolean;
  member_count: number;
};

type PostRow = {
  id: string;
  group_id: string;
  user_id: string;
  body: string;
  emotion: Emotion;
  created_at: Date;
  username: string;
  cat_type: CatType;
};

type Database = Sql | TransactionSql;

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    catType: row.cat_type,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function mapGroup(row: GroupRow): GroupSummary {
  return {
    id: row.id,
    name: row.name,
    isSolo: row.is_solo,
    memberCount: Number(row.member_count),
  };
}

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    groupId: row.group_id,
    userId: row.user_id,
    body: row.body,
    emotion: row.emotion,
    createdAt: row.created_at.toISOString(),
    user: {
      id: row.user_id,
      username: row.username,
      catType: row.cat_type,
    },
  };
}

function getInitialUsername(user: User): string {
  const metadataName = user.user_metadata.name;
  if (typeof metadataName === "string") {
    const trimmed = metadataName.trim();
    if (trimmed.length >= 1 && trimmed.length <= 20) {
      return trimmed;
    }
  }
  return "ななしの猫";
}

async function ensureProfile(sql: Database, user: User): Promise<ProfileRow> {
  const rows = await sql<ProfileRow[]>`
    insert into profiles (id, username, cat_type)
    values (${user.id}, ${getInitialUsername(user)}, 'white')
    on conflict (id) do update set id = excluded.id
    returning id, username, cat_type, created_at, updated_at
  `;
  const profile = rows[0];
  if (!profile) {
    throw new AppError("UNKNOWN", "プロフィールを取得できませんでした。");
  }
  return profile;
}

async function findGroup(sql: Database, groupId: string): Promise<GroupRow> {
  const rows = await sql<GroupRow[]>`
    select
      g.id,
      g.name,
      g.is_solo,
      count(gm.user_id)::integer as member_count
    from groups g
    left join group_members gm on gm.group_id = g.id
    where g.id = ${groupId}
    group by g.id
  `;
  const group = rows[0];
  if (!group) {
    throw new AppError("NOT_FOUND", "グループが見つかりません。");
  }
  return group;
}

async function requireMembership(sql: Database, groupId: string, userId: string): Promise<void> {
  const rows = await sql<{ exists: boolean }[]>`
    select exists(
      select 1 from group_members where group_id = ${groupId} and user_id = ${userId}
    ) as exists
  `;
  if (!rows[0]?.exists) {
    throw new AppError("FORBIDDEN", "このグループにはアクセスできません。");
  }
}

function createInviteCode(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const values = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

export async function getProfile(user: User): Promise<Profile> {
  const profile = await ensureProfile(getDatabase(), user);
  return mapProfile(profile);
}

export async function updateProfile(
  user: User,
  username: string,
  catType: CatType,
): Promise<Profile> {
  const sql = getDatabase();
  await ensureProfile(sql, user);
  const rows = await sql<ProfileRow[]>`
    update profiles
    set username = ${username}, cat_type = ${catType}, updated_at = now()
    where id = ${user.id}
    returning id, username, cat_type, created_at, updated_at
  `;
  const profile = rows[0];
  if (!profile) {
    throw new AppError("NOT_FOUND", "プロフィールが見つかりません。");
  }
  return mapProfile(profile);
}

export async function getGroups(user: User): Promise<GroupSummary[]> {
  const sql = getDatabase();
  await ensureProfile(sql, user);
  const rows = await sql<GroupRow[]>`
    select
      g.id,
      g.name,
      g.is_solo,
      count(all_members.user_id)::integer as member_count
    from group_members mine
    join groups g on g.id = mine.group_id
    left join group_members all_members on all_members.group_id = g.id
    where mine.user_id = ${user.id}
    group by g.id, mine.joined_at
    order by mine.joined_at desc
  `;
  return rows.map(mapGroup);
}

export async function startSoloGroup(user: User): Promise<GroupSummary> {
  const sql = getDatabase();
  return sql.begin(async (transaction) => {
    await ensureProfile(transaction, user);
    const inserted = await transaction<{ id: string }[]>`
      insert into groups (name, owner_id, is_solo)
      values ('ひとりの部屋', ${user.id}, true)
      on conflict (owner_id) where is_solo do nothing
      returning id
    `;
    let groupId = inserted[0]?.id;
    if (groupId) {
      await transaction`
        insert into group_members (group_id, user_id)
        values (${groupId}, ${user.id})
      `;
    } else {
      const existing = await transaction<{ id: string }[]>`
        select id from groups where owner_id = ${user.id} and is_solo = true
      `;
      groupId = existing[0]?.id;
    }
    if (!groupId) {
      throw new AppError("UNKNOWN", "一人モードを開始できませんでした。");
    }
    return mapGroup(await findGroup(transaction, groupId));
  });
}

export async function createGroup(
  user: User,
  name: string,
): Promise<{ group: GroupSummary; inviteCode: string }> {
  const sql = getDatabase();
  return sql.begin(async (transaction) => {
    await ensureProfile(transaction, user);
    const groups = await transaction<{ id: string }[]>`
      insert into groups (name, owner_id, is_solo)
      values (${name}, ${user.id}, false)
      returning id
    `;
    const groupId = groups[0]?.id;
    if (!groupId) {
      throw new AppError("UNKNOWN", "グループを作成できませんでした。");
    }
    await transaction`
      insert into group_members (group_id, user_id)
      values (${groupId}, ${user.id})
    `;
    const inviteCode = createInviteCode();
    await transaction`
      insert into invite_codes (group_id, code)
      values (${groupId}, ${inviteCode})
    `;
    return {
      group: mapGroup(await findGroup(transaction, groupId)),
      inviteCode,
    };
  });
}

export async function joinGroup(user: User, code: string): Promise<GroupSummary> {
  const sql = getDatabase();
  return sql.begin(async (transaction) => {
    await ensureProfile(transaction, user);
    const groups = await transaction<{ id: string }[]>`
      select g.id
      from groups g
      join invite_codes invitation on invitation.group_id = g.id
      where invitation.code = ${code}
      for update of g
    `;
    const groupId = groups[0]?.id;
    if (!groupId) {
      throw new AppError("INVALID_INVITE_CODE", "招待コードが見つかりません。");
    }
    const memberships = await transaction<{ exists: boolean; count: number }[]>`
      select
        exists(
          select 1 from group_members where group_id = ${groupId} and user_id = ${user.id}
        ) as exists,
        count(*)::integer as count
      from group_members
      where group_id = ${groupId}
    `;
    const membership = memberships[0];
    if (membership?.exists) {
      throw new AppError("ALREADY_JOINED", "このグループには参加済みです。");
    }
    if (Number(membership?.count) >= 5) {
      throw new AppError("GROUP_FULL", "このグループは5人に達しています。");
    }
    await transaction`
      insert into group_members (group_id, user_id)
      values (${groupId}, ${user.id})
    `;
    return mapGroup(await findGroup(transaction, groupId));
  });
}

export async function getPosts(
  user: User,
  groupId: string,
): Promise<{ group: GroupSummary; posts: Post[] }> {
  const sql = getDatabase();
  await requireMembership(sql, groupId, user.id);
  const [group, rows] = await Promise.all([
    findGroup(sql, groupId),
    sql<PostRow[]>`
      select
        post.id,
        post.group_id,
        post.user_id,
        post.body,
        post.emotion,
        post.created_at,
        profile.username,
        profile.cat_type
      from posts post
      join profiles profile on profile.id = post.user_id
      where post.group_id = ${groupId}
      order by post.created_at desc
    `,
  ]);
  return { group: mapGroup(group), posts: rows.map(mapPost) };
}

export async function addPost(
  user: User,
  groupId: string,
  body: string,
  emotion: Emotion,
): Promise<Post> {
  const sql = getDatabase();
  return sql.begin(async (transaction) => {
    await requireMembership(transaction, groupId, user.id);
    const rows = await transaction<PostRow[]>`
      with inserted as (
        insert into posts (group_id, user_id, body, emotion)
        values (${groupId}, ${user.id}, ${body}, ${emotion})
        returning id, group_id, user_id, body, emotion, created_at
      )
      select inserted.*, profile.username, profile.cat_type
      from inserted
      join profiles profile on profile.id = inserted.user_id
    `;
    const post = rows[0];
    if (!post) {
      throw new AppError("UNKNOWN", "投稿を作成できませんでした。");
    }
    return mapPost(post);
  });
}
