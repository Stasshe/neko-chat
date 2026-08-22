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

import { MobileShell } from "@/components/mobile-shell";
import { LoadingState } from "@/components/status";
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

export type OptimisticPost = Post & { pending?: boolean };

type AppContextValue = {
  profile: Profile | null;
  groups: GroupSummary[];
  currentGroup: GroupSummary | null;
  posts: OptimisticPost[];
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

function isUnauthorized(error: Error): boolean {
  return error instanceof AppError && error.code === "UNAUTHORIZED";
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
  const [posts, setPosts] = useState<OptimisticPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const redirectTargetRef = useRef<string | null>(null);

  function handleAuthError(error: Error): boolean {
    if (isUnauthorized(error)) {
      router.replace("/");
      return true;
    }
    return false;
  }

  async function loadPosts(group: GroupSummary) {
    const nextPosts = await getGroupPosts(group.id);
    setPosts(nextPosts);
  }

  const loadPostsEvent = useEffectEvent(loadPosts);

  useEffect(() => {
    if (!currentGroup) {
      return;
    }
    const client = getSupabaseClient();
    if (!client) {
      return;
    }
    const channel = client
      .channel(`posts-${currentGroup.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
          filter: `group_id=eq.${currentGroup.id}`,
        },
        () => {
          void loadPostsEvent(currentGroup);
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [currentGroup]);

  async function refresh() {
    setError(null);
    await withLoading(setLoading, async () => {
      try {
        const [nextProfile, nextGroups] = await Promise.all([getMyProfile(), getMyGroups()]);
        setProfile(nextProfile);
        setGroups(nextGroups);

        const onboardingTarget = resolveOnboardingRedirect(nextProfile, nextGroups);
        if (onboardingTarget) {
          const profileIsIncomplete = onboardingTarget === "/onboarding/profile";
          const isOutsideOnboarding = !pathname.startsWith("/onboarding");
          const isAtCompletedProfileStep =
            pathname === "/onboarding/profile" && !profileIsIncomplete;
          if (
            (profileIsIncomplete && pathname !== onboardingTarget) ||
            isOutsideOnboarding ||
            isAtCompletedProfileStep
          ) {
            redirectTargetRef.current = onboardingTarget;
            router.replace(onboardingTarget);
            return;
          }
        } else if (pathname === "/onboarding/profile") {
          redirectTargetRef.current = "/home";
          router.replace("/home");
          return;
        }

        setInitialized(true);
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
        if (!handleAuthError(normalized)) {
          setError(getErrorMessage(normalized));
        }
        setInitialized(true);
      }
    });
  }

  const refreshAfterNavigation = useEffectEvent(refresh);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    // Effect Event kicks off the initial load; loading flag flip is intentional, not derivable.
    // react-doctor-disable-next-line react-hooks-js/set-state-in-effect
    void refreshAfterNavigation();
  }, []);

  useEffect(() => {
    if (redirectTargetRef.current && pathname === redirectTargetRef.current) {
      redirectTargetRef.current = null;
      setInitialized(true);
    }
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
        if (!handleAuthError(normalized)) {
          setError(getErrorMessage(normalized));
        }
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
        if (!handleAuthError(normalized)) {
          setError(getErrorMessage(normalized));
        }
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
        if (!handleAuthError(normalized)) {
          setError(getErrorMessage(normalized));
        }
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
        if (!handleAuthError(normalized)) {
          setError(getErrorMessage(normalized));
        }
        throw normalized;
      }
    });
  }

  async function saveProfile(username: string, catType: CatType) {
    setError(null);
    const previousProfile = profile;
    if (previousProfile) {
      setProfile({ ...previousProfile, username, catType });
    }
    try {
      const nextProfile = await updateMyProfile(username, catType);
      setProfile(nextProfile);
    } catch (requestError) {
      if (previousProfile) {
        setProfile(previousProfile);
      }
      const normalized = normalizeError(requestError);
      if (!handleAuthError(normalized)) {
        setError(getErrorMessage(normalized));
      }
      throw normalized;
    }
  }

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
      if (!handleAuthError(normalized)) {
        setError(getErrorMessage(normalized));
      }
      throw normalized;
    }
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

  if (!initialized) {
    return (
      <MobileShell>
        <LoadingState />
      </MobileShell>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
