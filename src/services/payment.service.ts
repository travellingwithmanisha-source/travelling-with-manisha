import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { PaymentGateway, PaymentStatus, BookingStatus, type Prisma } from "@prisma/client";

/**
 * Provider-agnostic payment interface — the booking flow calls these
 * without knowing which gateway is active, per ARCHITECTURE.md's
 * `payment.service.ts` design. Gateway selection is by currency: INR ->
 * Razorpay, everything else -> Stripe. Revisit this rule if
 * international INR pricing or India-based USD pricing ever comes up.
 */

function selectGateway(): PaymentGateway {
  return PaymentGateway.RAZORPAY;
}

export async function createPaymentIntent(bookingId: string) {
const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
const gateway = selectGateway();
const amountInMinorUnits = Math.round(Number(booking.totalAmount) * 100);
const idempotencyKey = `booking_${booking.id}_${Date.now()}`;

  if (!razorpay) {
  throw new Error("Razorpay is not configured.");
}
if (!razorpay) {
  throw new Error("Razorpay is not configured.");
}
  // RAZORPAY
 // RAZORPAY
if (!razorpay) {
  throw new Error("Razorpay is not configured.");
}

const order = await razorpay!.orders.create({
  amount: amountInMinorUnits,
  currency: booking.currency,
  receipt: booking.bookingNumber,
  notes: { bookingId: booking.id },
});

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      gateway,
      gatewayOrderId: order.id,
      idempotencyKey,
      amount: booking.totalAmount,
      currency: booking.currency,
      status: PaymentStatus.PENDING,
    },
  });

  return { razorpayOrderId: order.id, keyId: process.env.RAZORPAY_KEY_ID };
}

/**
 * Marks a Payment as succeeded and the parent Booking as confirmed.
 * Called from the two webhook route handlers after signature
 * verification — never called directly from client-trusted input.
 */
export async function markPaymentSucceeded(params: {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewayMetadata: Prisma.InputJsonValue;
}) {
  return prisma.$transaction(async (tx) => {
    // gatewayOrderId is indexed but not a unique constraint in
    // schema.prisma (a gateway could theoretically reuse an id across
    // very different order types), so it can't be used directly in an
    // `update({ where })` — look the row up first, then update by id.
    const existing = await tx.payment.findFirstOrThrow({
      where: { gatewayOrderId: params.gatewayOrderId },
    });

    const payment = await tx.payment.update({
      where: { id: existing.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        gatewayPaymentId: params.gatewayPaymentId,
        gatewayMetadata: params.gatewayMetadata,
        paidAt: new Date(),
      },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.CONFIRMED },
    });

    return payment;
  });
}

export async function markPaymentFailed(gatewayOrderId: string, failureReason: string) {
  const existing = await prisma.payment.findFirstOrThrow({ where: { gatewayOrderId } });
  return prisma.payment.update({
    where: { id: existing.id },
    data: { status: PaymentStatus.FAILED, failureReason },
  });
}
