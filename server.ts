import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use in Server Components, Route Handlers, and
 * Server Actions. Reads/writes the session via Next.js's cookie store.
 *
 * `setAll` is wrapped in try/catch because Server *Components* can't set
 * cookies (Next.js throws if you try) — that's fine as long as
 * `src/middleware.ts` is refreshing the session on every request; only
 * Server Actions and Route Handlers actually need to persist a refreshed
 * session here.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore because
            // src/middleware.ts refreshes the session on every request.
          }
        },
      },
    }
  );
}

/**
 * Server-only Supabase client using the service role key, which bypasses
 * Row Level Security. Reserved for privileged operations (webhooks,
 * admin scripts) that must run outside a specific user's session — never
 * import this into anything reachable from client-side code, and never
 * use it as a substitute for checking a user's actual role/permissions.
 */
export function createServiceRoleClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}
