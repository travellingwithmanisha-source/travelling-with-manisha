import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/maps";
import { rateLimit } from "@/lib/rate-limit";
import type { ApiResponse } from "@/types";

/**
 * GET /api/maps/geocode?address=...
 * Used by the homestay creation form to resolve a typed address to
 * coordinates before saving (see `lib/maps.ts`). Auth-gated (not public)
 * since it spends Google Maps API quota on our billing account —
 * unauthenticated traffic hitting this in a loop would run up costs for
 * no benefit to a signed-out visitor.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { success: withinLimit } = rateLimit(`geocode:${user.id}`, 20, 60 * 1000);
  if (!withinLimit) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Too many geocoding requests" }, { status: 429 });
  }

  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "address is required" }, { status: 400 });
  }

  const result = await geocodeAddress(address);
  if (!result) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Address not found" }, { status: 404 });
  }

  return NextResponse.json<ApiResponse<typeof result>>({ success: true, data: result });
}
