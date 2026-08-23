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
          filter: `group_id=eq.${currentGroup.id}`,
        },
        () => {
          void loadPostsEvent(currentGroup);
        },
      )
      .subscribe((status, err) => {
        console.log("[realtime] posts channel status:", status, err);
      });

    return () => {
      void client.removeChannel(channel);
    };
  }, [currentGroup]);
}
