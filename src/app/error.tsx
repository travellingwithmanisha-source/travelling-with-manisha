"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: wire up to actual error reporting (Sentry or similar) once
    // chosen — logging to console is a placeholder, not the final story.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        That's on us, not you. Try again, and if it keeps happening, let us know.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
