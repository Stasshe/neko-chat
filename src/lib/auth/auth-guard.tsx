"use client";

import { redirect } from "next/navigation";

import { MobileShell } from "@/components/mobile-shell";
import { LoadingState } from "@/components/status";

import { useAuth } from "./use-auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <MobileShell>
        <LoadingState />
      </MobileShell>
    );
  }

  if (!isAuthenticated) {
    redirect("/");
  }

  return <>{children}</>;
}
