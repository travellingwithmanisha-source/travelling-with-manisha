/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * LIMITATION, stated plainly: this is per-server-instance memory, so it
 * does NOT work correctly across multiple deployment instances (Vercel
 * can and does run several) — a client could get up to N×instances
 * requests through. Fine for a single-instance dev/staging deploy or as
 * a cheap first line of defense; before relying on this in a
 * multi-instance production deployment, replace with a shared store
 * (Upstash Redis's `@upstash/ratelimit` is the standard pairing with
 * Vercel). Kept intentionally dependency-free here so it works without
 * provisioning Redis first.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

/** Best-effort client identifier for rate limiting behind Vercel's proxy. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}
