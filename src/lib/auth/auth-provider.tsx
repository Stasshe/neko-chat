"use client";

import type { Session } from "@supabase/supabase-js";
import { createContext, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  session: Session | null;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Failed to restore auth session", error);
      }

      if (!isMounted) {
        return;
      }

      setSession(data.session ?? null);
      setIsLoading(false);
    }

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Failed to sign out", error);
    }
  }

  const value = {
    isLoading,
    isAuthenticated: !!session,
    userId: session?.user.id ?? null,
    session,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
