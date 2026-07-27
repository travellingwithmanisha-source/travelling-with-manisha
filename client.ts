import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components ("use client" files).
 * Never import this from a Server Component or route handler — use
 * `lib/supabase/server.ts` there instead, so cookies are handled
 * correctly for SSR.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
