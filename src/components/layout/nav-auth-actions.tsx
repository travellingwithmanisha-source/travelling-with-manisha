"use client";

import Link from "next/link";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";

/**
 * Split out from Navbar (a server component) because this is the one
 * part of the marketing nav that needs live client-side auth state —
 * swapping "Log in / Sign up" for "Dashboard" without a full page
 * reload when auth state changes elsewhere in the tab (e.g. after
 * signing out from a different component). Uses `useSession`, which
 * existed but wasn't wired into any page before this audit pass.
 */
export function NavAuthActions() {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />;
  }

  if (user) {
    return (
      <Button size="sm" asChild>
        <Link href="/dashboard">Dashboard</Link>
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Log in</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/register">Sign up</Link>
      </Button>
    </>
  );
}
