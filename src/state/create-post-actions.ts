import { createPost as createPostRequest } from "@/lib/api";
import { resolveEmotion } from "@/lib/cat-assets";
import { AppError, type Emotion, type GroupSummary, type Profile } from "@/types/app";

import { getErrorMessage, normalizeError, type OptimisticPost } from "./app-provider-shared";

type Params = {
  currentGroup: GroupSummary | null;
  profile: Profile | null;
  setPosts: (updater: (current: OptimisticPost[]) => OptimisticPost[]) => void;
  setError: (error: string | null) => void;
  handleAuthError: (error: Error) => Promise<boolean>;
};

export function createPostActions({
  currentGroup,
  profile,
  setPosts,
  setError,
  handleAuthError,
}: Params) {
  async function publishPost(body: string, emotion: Emotion) {
    if (!currentGroup) {
      throw new AppError("NOT_FOUND", "投稿先のグループがありません。");
    }
    if (!profile) {
      throw new AppError("NOT_FOUND", "プロフィールが見つかりません。");
    }
    setError(null);
    const concreteEmotion = resolveEmotion(emotion);
    const optimisticPost: OptimisticPost = {
      id: `optimistic-${crypto.randomUUID()}`,
      groupId: currentGroup.id,
      userId: profile.id,
      body,
      emotion: concreteEmotion,
      createdAt: new Date().toISOString(),
      user: { id: profile.id, username: profile.username, catType: profile.catType },
      pending: true,
    };
    setPosts((current) => [optimisticPost, ...current]);
    try {
      const created = await createPostRequest(currentGroup.id, body, concreteEmotion);
      setPosts((current) =>
        current.map((post) => (post.id === optimisticPost.id ? created : post)),
      );
    } catch (requestError) {
      setPosts((current) => current.filter((post) => post.id !== optimisticPost.id));
      const normalized = normalizeError(requestError);
      if (!(await handleAuthError(normalized))) {
        setError(getErrorMessage(normalized));
      }
      throw normalized;
    }
  }

  return { publishPost };
}
