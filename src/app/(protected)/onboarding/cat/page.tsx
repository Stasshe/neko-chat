"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { CatDisplay } from "@/components/cat-display";
import { MobileShell } from "@/components/mobile-shell";
import { ErrorState } from "@/components/status";
import { useApp } from "@/state/app-provider";
import { type CatType, catTypes } from "@/types/app";

const catLabels: Record<CatType, string> = {
  white: "しろねこ",
  black: "くろねこ",
  mike: "みけねこ",
  sham: "しゃむねこ",
  chatora: "ちゃとら",
};

function getButtonLabel(loading: boolean): string {
  if (loading) {
    return "保存中";
  }
  return "決定";
}

function CatSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, loading, error, saveProfile } = useApp();
  const [selected, setSelected] = useState<CatType>("white");

  async function confirm() {
    const username = profile?.username ?? window.localStorage.getItem("neko-chat.username") ?? "";
    if (!username) {
      router.push("/onboarding/profile");
      return;
    }
    try {
      await saveProfile(username, selected);
      // Closed allowlist compare, not an open redirect: only "settings" routes anywhere.
      // react-doctor-disable-next-line react-doctor/url-prefilled-privileged-action
      if (searchParams.get("returnTo") === "settings") {
        router.push("/settings");
        return;
      }
      router.push("/home");
    } catch {
      // The provider exposes the actionable error message.
    }
  }

  return (
    <MobileShell>
      <section className="cat-selection">
        <h1>ねこをえらんでね</h1>
        <div className="cat-grid">
          {catTypes.map((catType) => (
            <button
              type="button"
              onClick={() => setSelected(catType)}
              key={catType}
              aria-pressed={selected === catType}
            >
              <CatDisplay type={catType} pose="stand" />
              <strong>{catLabels[catType]}</strong>
            </button>
          ))}
        </div>
        {error && <ErrorState message={error} />}
        <button
          className="primary-button"
          type="button"
          onClick={() => void confirm()}
          disabled={loading}
        >
          {getButtonLabel(loading)}
        </button>
      </section>
    </MobileShell>
  );
}

export default function CatSelectionPage() {
  return (
    <Suspense fallback={null}>
      <CatSelectionContent />
    </Suspense>
  );
}
