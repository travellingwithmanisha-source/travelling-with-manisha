import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/services/user.service";
import { createBooking, getUserBookings } from "@/services/booking.service";
import { createBookingSchema } from "@/lib/validators/booking.schema";
import { rateLimit } from "@/lib/rate-limit";
import type { ApiResponse } from "@/types";

async function requireUser(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();
  if (!supabaseUser) return null;
  return getUserBySupabaseId(supabaseUser.id);
}

/** GET /api/bookings — the current user's own bookings. */
export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await getUserBookings(user.id);
  return NextResponse.json<ApiResponse<typeof bookings>>({ success: true, data: bookings });
}

/**
 * POST /api/bookings
 * Validates against the discriminated-union `createBookingSchema` (see
 * `lib/validators/booking.schema.ts`), then hands off to
 * `booking.service.ts`. Note: the HOMESTAY path currently throws — see
 * the TODO in `booking.service.ts`'s `createHomestayBooking` — until the
 * availability-locking transaction is implemented, so this route will
 * surface that as a 500 for homestay bookings specifically.
 */
export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { success: withinLimit } = rateLimit(`booking:${user.id}`, 10, 10 * 60 * 1000);
  if (!withinLimit) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Too many booking attempts — please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const booking = await createBooking(user.id, parsed.data);
    return NextResponse.json<ApiResponse<typeof booking>>({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : "Booking failed" },
      { status: 500 }
    );
  }
}
