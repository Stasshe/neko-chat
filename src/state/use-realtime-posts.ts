"use client";

import { useEffect, useEffectEvent } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";
import type { GroupSummary } from "@/types/app";

export function useRealtimePosts(
  currentGroup: GroupSummary | null,
  loadPosts: (group: GroupSummary) => Promise<void>,
) {
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
        },
        (payload) => {
          if (payload.new.group_id !== currentGroup.id) {
            return;
          }
          void loadPostsEvent(currentGroup);
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [currentGroup]);
}
