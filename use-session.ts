"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/**
 * Client-side hook for the current Supabase user, kept in sync with
 * auth state changes (sign-in, sign-out, token refresh). For Server
 * Components, use `lib/supabase/server.ts` directly instead — this hook
 * is for Client Components that need to react to auth state changing
 * without a full page reload (e.g. a navbar's login/logout button).
 */
export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoading, isAuthenticated: user !== null };
}
