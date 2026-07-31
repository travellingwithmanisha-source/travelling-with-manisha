"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
}

interface MapWrapperProps {
  markers: MapMarker[];
  centerLat: number;
  centerLng: number;
  zoom?: number;
  className?: string;
}

/**
 * Thin wrapper around `@vis.gl/react-google-maps`, the one place that
 * library is imported from — per ARCHITECTURE.md's "one initialization
 * point per provider" convention. Used for a homestay's location and for
 * a tour package's itinerary map.
 *
 * Requires `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — this is a client
 * component, so only the browser-restricted key belongs here, never
 * `GOOGLE_MAPS_SERVER_API_KEY` (see `lib/maps.ts`).
 */
export function MapWrapper({ markers, centerLat, centerLng, zoom = 12, className }: MapWrapperProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className={className}>
        <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Map unavailable — NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: centerLat, lng: centerLng }}
          defaultZoom={zoom}
          mapId="travelling-with-manisha-map"
          gestureHandling="cooperative"
          disableDefaultUI={false}
        >
          {markers.map((marker) => (
            <AdvancedMarker
              key={marker.id}
              position={{ lat: marker.latitude, lng: marker.longitude }}
              title={marker.label}
            />
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
