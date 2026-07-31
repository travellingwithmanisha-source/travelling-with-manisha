import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names, resolving conflicts (e.g. `p-2 p-4` -> `p-4`)
 * the way shadcn/ui components expect. Used by every `components/ui/*`
 * primitive and any component accepting a `className` override prop.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a Decimal-as-string/number amount as a localized currency string.
 * Amounts throughout the schema are stored as Decimal(10,2) — Prisma
 * returns these as its `Decimal` type, which stringifies safely with
 * `.toString()` / `Number(...)` for display purposes (never do currency
 * *math* with the resulting number — do that in the service layer with
 * Prisma's Decimal or a fixed-point library instead).
 */
export function formatCurrency(
  amount: number | string,
  currency: string = "INR",
  locale: string = "en-IN"
): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a date range the way booking/itinerary UI needs it
 * ("12 Aug – 15 Aug 2026"), collapsing the year/month when both dates
 * share it.
 */
export function formatDateRange(start: Date, end: Date, locale: string = "en-IN"): string {
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: sameMonth ? undefined : "short",
  }).format(start);
  const endFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(end);
  return `${startFmt} – ${endFmt}`;
}

/** Truncates text to a max length on a word boundary, appending an ellipsis. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength);
  return `${trimmed.slice(0, trimmed.lastIndexOf(" "))}…`;
}
