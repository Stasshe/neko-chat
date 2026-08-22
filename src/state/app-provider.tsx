"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";

import {
  createGroupWithInvite,
  createPost as createPostRequest,
  getGroupPosts,
  getMyGroups,
  getMyProfile,
  joinGroupByInviteCode,
  startSoloMode,
  updateMyProfile,
} from "@/lib/api";
import { resolveEmotion } from "@/lib/cat-assets";
import { defaultUsername } from "@/lib/profile";
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
  composeOpen: boolean;
  openCompose: () => void;
  closeCompose: () => void;
  refresh: () => Promise<void>;
  selectGroup: (group: GroupSummary) => Promise<void>;
  startSolo: () => Promise<GroupSummary>;
  createGroup: (name: string) => Promise<{ group: GroupSummary; inviteCode: string }>;
  joinGroup: (code: string) => Promise<GroupSummary>;
  saveProfile: (username: string, catType: CatType) => Promise<void>;
  publishPost: (body: string, emotion: Emotion) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

function resolveOnboardingRedirect(profile: Profile, groups: GroupSummary[]): string | null {
  if (profile.username === defaultUsername) {
    return "/onboarding/profile";
  }
  if (groups.length === 0) {
    return "/onboarding/mode";
  }
  return null;
}

const AppContext = createContext<AppContextValue | null>(null);

function getErrorMessage(error: Error): string {
  if (error instanceof AppError) {
    return error.message;
  }
  console.error(error);
  return "読み込みに失敗しました。時間をおいてもう一度お試しください。";
}

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}

async function withLoading<T>(
  setLoading: (loading: boolean) => void,
  operation: () => Promise<T>,
): Promise<T> {
  setLoading(true);
  try {
    return await operation();
  } finally {
    setLoading(false);
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [currentGroup, setCurrentGroup] = useState<GroupSummary | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  async function loadPosts(group: GroupSummary) {
    const nextPosts = await getGroupPosts(group.id);
    setPosts(nextPosts);
  }

  async function refresh() {
    setError(null);
    await withLoading(setLoading, async () => {
      try {
        const [nextProfile, nextGroups] = await Promise.all([getMyProfile(), getMyGroups()]);
        setProfile(nextProfile);
        setGroups(nextGroups);

        const onboardingTarget = resolveOnboardingRedirect(nextProfile, nextGroups);
        if (!pathname.startsWith("/onboarding") && onboardingTarget) {
          router.replace(onboardingTarget);
          return;
        }

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
        const normalized = normalizeError(requestError);
        setError(getErrorMessage(normalized));
      }
    });
  }

  const refreshAfterNavigation = useEffectEvent(refresh);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current || pathname.startsWith("/onboarding")) {
      return;
    }
    hasLoadedRef.current = true;
    // Effect Event kicks off the initial load; loading flag flip is intentional, not derivable.
    // react-doctor-disable-next-line react-hooks-js/set-state-in-effect
    void refreshAfterNavigation();
  }, [pathname]);

  async function selectGroup(group: GroupSummary) {
    setError(null);
    await withLoading(setLoading, async () => {
      try {
        await loadPosts(group);
        setCurrentGroup(group);
        window.localStorage.setItem(currentGroupKey, group.id);
        router.push("/home");
      } catch (requestError) {
        const normalized = normalizeError(requestError);
        setError(getErrorMessage(normalized));
      }
    });
  }

  async function startSolo() {
    setError(null);
    return withLoading(setLoading, async () => {
      try {
        const group = await startSoloMode();
        setCurrentGroup(group);
        setGroups((current) => [group, ...current.filter((item) => item.id !== group.id)]);
        window.localStorage.setItem(currentGroupKey, group.id);
        return group;
      } catch (requestError) {
        const normalized = normalizeError(requestError);
        setError(getErrorMessage(normalized));
        throw normalized;
      }
    });
  }

  async function createGroup(name: string) {
    setError(null);
    return withLoading(setLoading, async () => {
      try {
        const result = await createGroupWithInvite(name);
        setCurrentGroup(result.group);
        setGroups((current) => [result.group, ...current]);
        window.localStorage.setItem(currentGroupKey, result.group.id);
        return result;
      } catch (requestError) {
        const normalized = normalizeError(requestError);
        setError(getErrorMessage(normalized));
        throw normalized;
      }
    });
  }

  async function joinGroup(code: string) {
    setError(null);
    return withLoading(setLoading, async () => {
      try {
        const group = await joinGroupByInviteCode(code);
        setCurrentGroup(group);
        setGroups((current) => [group, ...current.filter((item) => item.id !== group.id)]);
        window.localStorage.setItem(currentGroupKey, group.id);
        return group;
      } catch (requestError) {
        const normalized = normalizeError(requestError);
        setError(getErrorMessage(normalized));
        throw normalized;
      }
    });
  }

  async function saveProfile(username: string, catType: CatType) {
    setError(null);
    await withLoading(setLoading, async () => {
      try {
        const nextProfile = await updateMyProfile(username, catType);
        setProfile(nextProfile);
      } catch (requestError) {
        const normalized = normalizeError(requestError);
        setError(getErrorMessage(normalized));
        throw normalized;
      }
    });
  }

  async function publishPost(body: string, emotion: Emotion) {
    if (!currentGroup) {
      throw new AppError("NOT_FOUND", "投稿先のグループがありません。");
    }
    setError(null);
    await withLoading(setLoading, async () => {
      try {
        await createPostRequest(currentGroup.id, body, resolveEmotion(emotion));
        await loadPosts(currentGroup);
      } catch (requestError) {
        const normalized = normalizeError(requestError);
        setError(getErrorMessage(normalized));
        throw normalized;
      }
    });
  }

  function openCompose() {
    setComposeOpen(true);
  }

  function closeCompose() {
    setComposeOpen(false);
  }

  async function signOut() {
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
  }

  const value = {
    profile,
    groups,
    currentGroup,
    posts,
    loading,
    error,
    composeOpen,
    openCompose,
    closeCompose,
    refresh,
    selectGroup,
    startSolo,
    createGroup,
    joinGroup,
    saveProfile,
    publishPost,
    signOut,
    clearError: () => setError(null),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
