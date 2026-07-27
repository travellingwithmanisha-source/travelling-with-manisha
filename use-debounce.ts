"use client";

import { useEffect, useState } from "react";

/**
 * Debounces a fast-changing value (e.g. a search input) so dependent
 * effects (API calls, filtering) only fire `delayMs` after the value
 * settles. Typical use: destination search-as-you-type.
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
