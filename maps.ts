/**
 * Server-only Google Maps helpers (Geocoding API). The client-side map
 * itself is rendered via `@vis.gl/react-google-maps` directly in
 * `components/maps/*`, using `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — that key
 * is browser-key-restricted (HTTP referrer) per `README.md`'s deployment
 * checklist, whereas this file's `GOOGLE_MAPS_SERVER_API_KEY` is
 * IP-restricted and must never reach the client bundle.
 */

const GEOCODE_ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json";

export interface GeocodeResult {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

/**
 * Resolves a free-text address to coordinates. Used by
 * `app/api/maps/geocode/route.ts` when an owner creates/edits a homestay
 * without dropping a pin directly on the map.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_SERVER_API_KEY is not set");
  }

  const url = `${GEOCODE_ENDPOINT}?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geocoding request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    status: string;
    results: Array<{
      formatted_address: string;
      place_id: string;
      geometry: { location: { lat: number; lng: number } };
    }>;
  };

  if (data.status !== "OK" || data.results.length === 0) {
    return null;
  }

   const result = data.results[0];

  if (!result) {
    return null;
  }

  return {
    formattedAddress: result.formatted_address,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    placeId: result.place_id,
  };
}
