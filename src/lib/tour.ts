"use client";

import { useSyncExternalStore } from "react";

const tourStorageKeyPrefix = "neko-chat.tour-stage";

export type TourStage = "home" | "compose" | "done";

const tourStageListeners = new Set<() => void>();

function getTourStorageKey(userId: string) {
  return `${tourStorageKeyPrefix}.${userId}`;
}

function readTourStage(userId?: string | null) {
  if (!userId) {
    return null;
  }
  return window.localStorage.getItem(getTourStorageKey(userId));
}

function subscribeToTourStage(userId: string | null | undefined, listener: () => void) {
  function handleStorage(event: StorageEvent) {
    if (userId && event.key === getTourStorageKey(userId)) {
      listener();
    }
  }

  tourStageListeners.add(listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    tourStageListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useTourStage(userId?: string | null) {
  return useSyncExternalStore(
    (listener) => subscribeToTourStage(userId, listener),
    () => readTourStage(userId),
    () => null,
  );
}

export function setTourStage(userId: string, stage: TourStage) {
  window.localStorage.setItem(getTourStorageKey(userId), stage);
  for (const listener of tourStageListeners) {
    listener();
  }
}
