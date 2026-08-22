"use client";

import { useSyncExternalStore } from "react";

export const tourStorageKey = "neko-chat.tour-stage";

export type TourStage = "home" | "compose" | "done";

const tourStageListeners = new Set<() => void>();

function readTourStage() {
  return window.localStorage.getItem(tourStorageKey);
}

function subscribeToTourStage(listener: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === tourStorageKey) {
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

export function useTourStage() {
  return useSyncExternalStore(subscribeToTourStage, readTourStage, () => undefined);
}

export function setTourStage(stage: TourStage) {
  window.localStorage.setItem(tourStorageKey, stage);
  for (const listener of tourStageListeners) {
    listener();
  }
}
