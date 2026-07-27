import Razorpay from "razorpay";

/**
 * Server-only Razorpay client — same rules as `lib/stripe.ts`: never
 * import from a "use client" file. `RAZORPAY_KEY_SECRET` is server-only;
 * `RAZORPAY_KEY_ID` is the one piece client checkout code needs, and it's
 * fine to expose (Razorpay's own checkout.js requires it client-side),
 * but still read it from the server and pass it down explicitly per
 * request rather than adding a `NEXT_PUBLIC_` var for it, so there's a
 * single source of truth in `.env`.
 */
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET is not set");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
