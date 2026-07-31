import { NextResponse } from "next/server";
import { getHomestayById, getTourPackageById } from "@/services/trip.service";
import type { ApiResponse } from "@/types";

/**
 * GET /api/trips/[tripId]
 * `tripId` may be either a Homestay id or a TourPackage id — tries both
 * rather than requiring the caller to specify a type, since the two id
 * spaces never collide (both are UUIDs). Returns 404 if neither matches.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;

  const homestay = await getHomestayById(tripId);
  if (homestay) {
    return NextResponse.json<ApiResponse<typeof homestay>>({ success: true, data: homestay });
  }

  const tourPackage = await getTourPackageById(tripId);
  if (tourPackage) {
    return NextResponse.json<ApiResponse<typeof tourPackage>>({ success: true, data: tourPackage });
  }

  return NextResponse.json<ApiResponse<never>>({ success: false, error: "Not found" }, { status: 404 });
}
