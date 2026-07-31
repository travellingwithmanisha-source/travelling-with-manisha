"use client";

import { useState } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * On-demand browser geolocation (does not auto-prompt on mount — call
 * `request()` from a user-initiated action, e.g. a "Use my location"
 * button, since unsolicited permission prompts are a poor experience and
 * most browsers will block them outside a user gesture anyway).
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    isLoading: false,
    error: null,
  });

  function request() {
    if (!("geolocation" in navigator)) {
      setState((prev) => ({ ...prev, error: "Geolocation is not supported by this browser." }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isLoading: false,
          error: null,
        });
      },
      (error) => {
        setState((prev) => ({ ...prev, isLoading: false, error: error.message }));
      }
    );
  }

  return { ...state, request };
}
