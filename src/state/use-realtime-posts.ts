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
    console.log("[realtime] effect run, currentGroup:", currentGroup);
    if (!currentGroup) {
      console.log("[realtime] no currentGroup, skip");
      return;
    }
    const client = getSupabaseClient();
    console.log("[realtime] client:", client ? "ok" : "null");
    if (!client) {
      return;
    }
    console.log("[realtime] subscribing to channel:", `posts-${currentGroup.id}`);
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
        (payload) => {
          console.log("[realtime] INSERT event received:", payload);
          void loadPostsEvent(currentGroup);
        },
      )
      .subscribe((status, err) => {
        console.log("[realtime] posts channel status:", status, err);
      });

    return () => {
      console.log("[realtime] cleanup, removing channel");
      void client.removeChannel(channel);
    };
  }, [currentGroup]);
}
