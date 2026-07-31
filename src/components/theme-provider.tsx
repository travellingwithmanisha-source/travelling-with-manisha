"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Wraps `next-themes` — tailwind.config.ts already has `darkMode: "class"`
 * configured, and globals.css already defines a `.dark` variable block,
 * but nothing was toggling the class until this audit pass. New
 * dependency: `next-themes` (see the dependency-audit section of the
 * Phase 7 report for the install command).
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
