import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/services/user.service";
import { Sidebar } from "@/components/layout/sidebar";
import { adminNav } from "@/config/nav";

/**
 * Every nested route under (admin) is protected automatically by this
 * one check, per ARCHITECTURE.md's "why route groups" rationale — no
 * individual admin page needs to repeat this role check.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) {
    redirect("/login");
  }

  const user = await getUserBySupabaseId(supabaseUser.id);

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={adminNav} title="Admin" />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
