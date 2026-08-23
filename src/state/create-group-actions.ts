import type { useRouter } from "next/navigation";

import { createGroupWithInvite, joinGroupByInviteCode, startSoloMode } from "@/lib/api";
import type { GroupSummary } from "@/types/app";

import {
  currentGroupKey,
  getErrorMessage,
  normalizeError,
  withLoading,
} from "./app-provider-shared";

type Router = ReturnType<typeof useRouter>;

type Params = {
  router: Router;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentGroup: (group: GroupSummary) => void;
  setGroups: (updater: (current: GroupSummary[]) => GroupSummary[]) => void;
  loadPosts: (group: GroupSummary) => Promise<void>;
  handleAuthError: (error: Error) => Promise<boolean>;
};

export function createGroupActions({
  router,
  setError,
  setLoading,
  setCurrentGroup,
  setGroups,
  loadPosts,
  handleAuthError,
}: Params) {
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
        if (!(await handleAuthError(normalized))) {
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
        if (!(await handleAuthError(normalized))) {
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
        if (!(await handleAuthError(normalized))) {
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
        await loadPosts(group);
        setCurrentGroup(group);
        setGroups((current) => [group, ...current.filter((item) => item.id !== group.id)]);
        window.localStorage.setItem(currentGroupKey, group.id);
        return group;
      } catch (requestError) {
        const normalized = normalizeError(requestError);
        if (!(await handleAuthError(normalized))) {
          setError(getErrorMessage(normalized));
        }
        throw normalized;
      }
    });
  }

  return { selectGroup, startSolo, createGroup, joinGroup };
}
