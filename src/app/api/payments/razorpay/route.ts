import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/services/user.service";
import { createPaymentIntent } from "@/services/payment.service";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

/**
 * POST /api/payments/razorpay
 * Body: { bookingId: string }
 * See the note in app/api/payments/stripe/route.ts — same pattern,
 * mirrored for the INR/Razorpay path.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();
  if (!supabaseUser) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserBySupabaseId(supabaseUser.id);
  if (!user) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await request.json();
  if (typeof bookingId !== "string") {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "bookingId is required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== user.id) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Booking not found" }, { status: 404 });
  }
  if (booking.currency.toUpperCase() !== "INR") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "This booking's currency routes through Stripe, not Razorpay — use /api/payments/stripe." },
      { status: 400 }
    );
  }

  const result = await createPaymentIntent(bookingId);
  return NextResponse.json<ApiResponse<typeof result>>({ success: true, data: result });
}
