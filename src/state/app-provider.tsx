"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createPost as createPostRequest,
  getGroupPosts,
  getMyGroups,
  getMyProfile,
  updateMyProfile,
} from "@/lib/api";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  AppError,
  type CatType,
  type Emotion,
  type GroupSummary,
  type Post,
  type Profile,
} from "@/types/app";

const currentGroupKey = "neko-chat.current-group";

type AppContextValue = {
  profile: Profile | null;
  groups: GroupSummary[];
  currentGroup: GroupSummary | null;
  posts: Post[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  selectGroup: (group: GroupSummary) => Promise<void>;
  saveProfile: (username: string, catType: CatType) => Promise<void>;
  publishPost: (body: string, emotion: Emotion) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function getErrorMessage(error: Error): string {
  if (error instanceof AppError) {
    return error.message;
  }
  console.error(error);
  return "読み込みに失敗しました。時間をおいてもう一度お試しください。";
}

function normalizeError(error: object): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [currentGroup, setCurrentGroup] = useState<GroupSummary | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async (group: GroupSummary) => {
    const nextPosts = await getGroupPosts(group.id);
    setPosts(nextPosts);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextProfile, nextGroups] = await Promise.all([getMyProfile(), getMyGroups()]);
      setProfile(nextProfile);
      setGroups(nextGroups);

      const storedId = window.localStorage.getItem(currentGroupKey);
      const storedGroup = nextGroups.find((group) => group.id === storedId);
      const nextGroup = storedGroup ?? nextGroups[0] ?? null;
      setCurrentGroup(nextGroup);
      if (nextGroup) {
        window.localStorage.setItem(currentGroupKey, nextGroup.id);
        await loadPosts(nextGroup);
      } else {
        setPosts([]);
      }
    } catch (requestError) {
      const normalized = normalizeError(requestError as object);
      setError(getErrorMessage(normalized));
    } finally {
      setLoading(false);
    }
  }, [loadPosts]);

  useEffect(() => {
    if (pathname.startsWith("/onboarding")) {
      setLoading(false);
      return;
    }
    void refresh();
  }, [pathname, refresh]);

  const selectGroup = useCallback(
    async (group: GroupSummary) => {
      setLoading(true);
      setError(null);
      try {
        await loadPosts(group);
        setCurrentGroup(group);
        window.localStorage.setItem(currentGroupKey, group.id);
        router.push("/home");
      } catch (requestError) {
        const normalized = normalizeError(requestError as object);
        setError(getErrorMessage(normalized));
      } finally {
        setLoading(false);
      }
    },
    [loadPosts, router],
  );

  const saveProfile = useCallback(async (username: string, catType: CatType) => {
    setLoading(true);
    setError(null);
    try {
      const nextProfile = await updateMyProfile(username, catType);
      setProfile(nextProfile);
    } catch (requestError) {
      const normalized = normalizeError(requestError as object);
      setError(getErrorMessage(normalized));
      throw normalized;
    } finally {
      setLoading(false);
    }
  }, []);

  const publishPost = useCallback(
    async (body: string, emotion: Emotion) => {
      if (!currentGroup) {
        throw new AppError("NOT_FOUND", "投稿先のグループがありません。");
      }
      setLoading(true);
      setError(null);
      try {
        await createPostRequest(currentGroup.id, body, emotion);
        await loadPosts(currentGroup);
      } catch (requestError) {
        const normalized = normalizeError(requestError as object);
        setError(getErrorMessage(normalized));
        throw normalized;
      } finally {
        setLoading(false);
      }
    },
    [currentGroup, loadPosts],
  );

  const signOut = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      setError("Supabase の接続情報が設定されていません。");
      return;
    }
    const { error: signOutError } = await client.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      return;
    }
    window.localStorage.removeItem(currentGroupKey);
    router.replace("/");
  }, [router]);

  const value = useMemo(
    () => ({
      profile,
      groups,
      currentGroup,
      posts,
      loading,
      error,
      refresh,
      selectGroup,
      saveProfile,
      publishPost,
      signOut,
      clearError: () => setError(null),
    }),
    [
      profile,
      groups,
      currentGroup,
      posts,
      loading,
      error,
      refresh,
      selectGroup,
      saveProfile,
      publishPost,
      signOut,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
