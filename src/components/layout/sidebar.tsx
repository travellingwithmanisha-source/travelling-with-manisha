"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/nav";

interface SidebarProps {
  items: NavItem[];
  title?: string;
}

/**
 * Shared sidebar shell for the (dashboard) and (admin) route groups —
 * each layout passes its own nav list (`dashboardNav` / `adminNav` from
 * `config/nav.ts`) rather than this component hardcoding either.
 */
export function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r bg-muted/30">
      <div className="flex h-full flex-col gap-1 p-4">
        {title && (
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
        )}
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
