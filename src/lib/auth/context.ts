import type { Session } from "@supabase/supabase-js";
import { createContext } from "react";

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  session: Session | null;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
