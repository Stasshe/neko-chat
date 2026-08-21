"use client";

import { redirect } from "next/navigation";

import { useAuth } from "./use-auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <main className="min-h-screen bg-background text-foreground" />;
  }

  if (!isAuthenticated) {
    redirect("/");
  }

  return <>{children}</>;
}
