import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateUploadSignature } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rate-limit";
import type { ApiResponse } from "@/types";

/**
 * POST /api/upload
 * Body: { folder: string }
 *
 * Returns a signed-upload payload the client uses to upload directly to
 * Cloudinary (the file bytes never pass through our server) — see
 * `lib/cloudinary.ts`. Auth-gated so only signed-in users can mint an
 * upload signature; it does NOT otherwise restrict `folder`, so callers
 * (e.g. `components/forms/*` once built) are responsible for passing a
 * properly namespaced folder (`homestays/{homestayId}`, `avatars/{userId}`)
 * rather than a user-controlled arbitrary string.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { success: withinLimit } = rateLimit(`upload:${user.id}`, 30, 60 * 1000);
  if (!withinLimit) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Too many upload requests" }, { status: 429 });
  }

  const { folder } = await request.json();
  if (typeof folder !== "string" || folder.length === 0) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "folder is required" }, { status: 400 });
  }

  const signature = generateUploadSignature({ folder });
  return NextResponse.json<ApiResponse<typeof signature>>({ success: true, data: signature });
}
