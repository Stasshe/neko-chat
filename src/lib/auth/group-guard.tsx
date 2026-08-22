"use client";

import { redirect, usePathname } from "next/navigation";

import { MobileShell } from "@/components/mobile-shell";
import { LoadingState } from "@/components/status";
import { useApp } from "@/state/app-provider";

const groupRequiredPaths = ["/home", "/compose"];

function requiresGroup(pathname: string): boolean {
  return groupRequiredPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function GroupGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentGroup, error, isInitialized } = useApp();

  if (!requiresGroup(pathname)) {
    return <>{children}</>;
  }

  if (!isInitialized) {
    return (
      <MobileShell>
        <LoadingState label="グループを確認しています" />
      </MobileShell>
    );
  }

  if (!currentGroup && !error) {
    redirect("/onboarding/profile");
  }

  return <>{children}</>;
}
