import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Used wherever a list can legitimately be empty (no bookings yet, no
 * search results, no listings for an owner) — per the frontend-design
 * guidance, treat this as "an invitation to act," not a dead end, so
 * always prefer passing an `action` (e.g. a "Browse destinations"
 * button) over a bare message.
 */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center",
        className
      )}
    >
      <p className="text-base font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
