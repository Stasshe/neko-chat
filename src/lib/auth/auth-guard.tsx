"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "./use-auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <main className="min-h-screen bg-background text-foreground" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
