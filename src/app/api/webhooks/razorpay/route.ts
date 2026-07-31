import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { markPaymentSucceeded, markPaymentFailed } from "@/services/payment.service";
import type { Prisma } from "@prisma/client";

/**
 * Razorpay webhook — see the note in app/api/webhooks/stripe/route.ts on
 * why this is a separate route handler. Razorpay signs the raw request
 * body with HMAC-SHA256 using the webhook secret configured in the
 * Razorpay dashboard (`RAZORPAY_WEBHOOK_SECRET` — distinct from
 * `RAZORPAY_KEY_SECRET`, which authenticates API calls, not webhooks).
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
  }

  const rawBody = await request.text();

  const expectedSignature = createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  const isValid =
    signatureBuffer.length === expectedBuffer.length && timingSafeEqual(signatureBuffer, expectedBuffer);

  if (!isValid) {
    console.error("Razorpay webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    payload: {
      payment?: { entity: { id: string; order_id: string; status: string } };
      order?: { entity: { id: string } };
    };
  };

  switch (event.event) {
    case "payment.captured": {
      const payment = event.payload.payment?.entity;
      if (payment) {
        await markPaymentSucceeded({
          gatewayOrderId: payment.order_id,
          gatewayPaymentId: payment.id,
          gatewayMetadata: event as unknown as Prisma.InputJsonValue,
        });
      }
      break;
    }
    case "payment.failed": {
      const payment = event.payload.payment?.entity;
      if (payment) {
        await markPaymentFailed(payment.order_id, "Razorpay reported payment.failed");
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
