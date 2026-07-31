"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { Destination } from "@prisma/client";

/**
 * Client-side filter over an already-fetched destination list — no
 * refetch per keystroke, which is why `useDebounce` only needs a modest
 * delay here (it's debouncing a cheap client-side `.filter()`, not a
 * network request). For a larger destination list this would move to a
 * server-side search hitting `/api/trips`, at which point the debounce
 * matters a lot more.
 */
export function DestinationSearch({ destinations }: { destinations: Destination[] }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.state?.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q)
    );
  }, [destinations, debouncedQuery]);

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search destinations by name, state, or country…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
        aria-label="Search destinations"
      />

      {filtered.length === 0 ? (
        <EmptyState title="No destinations match that search" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((destination) => (
            <Link key={destination.id} href={`/destinations/${destination.slug}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">{destination.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {[destination.state, destination.country].filter(Boolean).join(", ")}
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
