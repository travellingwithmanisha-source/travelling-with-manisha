import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/services/user.service";
import {
  searchHomestays,
  searchTourPackages,
  createHomestayDraft,
} from "@/services/trip.service";
import { tripSearchSchema, createHomestaySchema } from "@/lib/validators/trip.schema";
import type { ApiResponse } from "@/types";

/**
 * GET /api/trips?type=homestay|tour_package&...searchParams
 * Public — no auth required. `type` defaults to "homestay".
 */
export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const { type, ...rest } = searchParams;

  const parsed = tripSearchSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid search parameters", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const result =
    type === "tour_package" ? await searchTourPackages(parsed.data) : await searchHomestays(parsed.data);

  return NextResponse.json<ApiResponse<typeof result>>({ success: true, data: result });
}

/**
 * POST /api/trips
 * Creates a DRAFT homestay. Requires an authenticated HOMESTAY_OWNER —
 * TourPackage creation is admin-only and intentionally not exposed here
 * (see `app/(admin)/admin/trips` for where that would be wired up).
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
  if (!user || (user.role !== "HOMESTAY_OWNER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createHomestaySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const homestay = await createHomestayDraft(user.id, parsed.data);
  return NextResponse.json<ApiResponse<typeof homestay>>({ success: true, data: homestay }, { status: 201 });
}
