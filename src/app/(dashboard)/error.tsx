"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Segment-local error boundary — a crash inside the dashboard no longer
 * takes down the whole app shell (which the root error.tsx would), just
 * this route group. See app/(admin)/error.tsx for the same pattern.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold">Something went wrong loading this page</h2>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
