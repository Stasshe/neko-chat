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
import { getGroupPosts, getMyGroups, getMyProfile } from "@/lib/api";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { CatType, Emotion, GroupSummary, Profile } from "@/types/app";

import {
  currentGroupKey,
  getErrorMessage,
  normalizeError,
  type OptimisticPost,
  resolveOnboardingRedirect,
  withLoading,
} from "./app-provider-shared";
import { createAuthErrorHandler } from "./create-auth-error-handler";
import { createGroupActions } from "./create-group-actions";
import { createPostActions } from "./create-post-actions";
import { createProfileActions } from "./create-profile-actions";
import { useRealtimePosts } from "./use-realtime-posts";

export type { OptimisticPost } from "./app-provider-shared";

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

const AppContext = createContext<AppContextValue | null>(null);

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

  const handleAuthError = createAuthErrorHandler(router);

  async function loadPosts(group: GroupSummary) {
    const nextPosts = await getGroupPosts(group.id);
    setPosts(nextPosts);
  }

  useRealtimePosts(currentGroup, loadPosts);

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
        if (!(await handleAuthError(normalized))) {
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

  const { selectGroup, startSolo, createGroup, joinGroup } = createGroupActions({
    router,
    setError,
    setLoading,
    setCurrentGroup,
    setGroups,
    loadPosts,
    handleAuthError,
  });

  const { saveProfile } = createProfileActions({ profile, setProfile, setError, handleAuthError });

  const { publishPost } = createPostActions({
    currentGroup,
    profile,
    setPosts,
    setError,
    handleAuthError,
  });

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
