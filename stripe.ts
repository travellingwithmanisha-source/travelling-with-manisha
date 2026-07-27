import Stripe from "stripe";

/**
 * Server-only Stripe client. Never import this from a "use client" file —
 * `STRIPE_SECRET_KEY` must never reach the browser bundle. The publishable
 * key (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) is what client components use,
 * via `@stripe/stripe-js`, not this file.
 *
 * apiVersion is intentionally left unpinned here — pin it once the
 * project settles on one (matching whatever version the Stripe dashboard
 * is configured for) rather than hardcoding a version string that will
 * silently drift out of date.
 */
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});
