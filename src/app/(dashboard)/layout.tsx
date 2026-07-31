import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/services/user.service";
import { Sidebar } from "@/components/layout/sidebar";
import { dashboardNav } from "@/config/nav";

/**
 * `src/middleware.ts` already redirects unauthenticated requests away
 * from this route group, but that check only knows "logged in or not" —
 * it can't (cheaply) know whether this Supabase identity has a matching
 * `User` row yet (e.g. the callback route hasn't run), so this layout
 * re-checks and redirects again if needed. Belt-and-suspenders, not
 * redundant: see the comment in `lib/supabase/middleware.ts`.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) {
    redirect("/login");
  }

  const user = await getUserBySupabaseId(supabaseUser.id);
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={dashboardNav} title={`${user.firstName} ${user.lastName}`} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
