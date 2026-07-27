import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Generates the signature a client needs to upload directly to Cloudinary
 * (bypassing our server for the actual file bytes) while still proving
 * the upload was authorized by us. Used by `app/api/upload/route.ts`.
 *
 * `folder` should be namespaced per entity (e.g. `homestays/{id}`,
 * `avatars/{userId}`) — callers are responsible for choosing it; this
 * helper doesn't enforce a scheme.
 */
export function generateUploadSignature(params: Record<string, string | number>) {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { ...params, timestamp },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}
