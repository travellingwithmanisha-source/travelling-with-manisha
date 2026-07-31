import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateUserFromSupabase } from "@/services/user.service";

/**
 * Handles every Supabase Auth redirect: email confirmation after
 * sign-up, magic links, and password-reset links (see
 * `app/(auth)/register/page.tsx` and `forgot-password/page.tsx`, both of
 * which point their `emailRedirectTo`/`redirectTo` here).
 *
 * Route handlers stay thin per ARCHITECTURE.md — the actual
 * Supabase-identity-to-User bridging logic lives in
 * `services/user.service.ts`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  await getOrCreateUserFromSupabase(data.user);

  return NextResponse.redirect(`${origin}${next}`);
}
