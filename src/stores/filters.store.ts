import { create } from "zustand";

/**
 * Client-side filter state for the destinations/homestay browsing UI.
 * Kept separate from URL search params intentionally simple for now —
 * once search is wired to `app/api/trips`, consider syncing this to the
 * URL (via `useSearchParams`) so filtered views are shareable/bookmarkable
 * rather than only living in client state.
 */
interface FiltersState {
  destinationSlug: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  guests: number;

  setDestination: (slug: string | null) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setGuests: (count: number) => void;
  clear: () => void;
}

const initialState = {
  destinationSlug: null,
  minPrice: null,
  maxPrice: null,
  guests: 1,
} satisfies Partial<FiltersState>;

export const useFiltersStore = create<FiltersState>((set) => ({
  ...initialState,

  setDestination: (destinationSlug) => set({ destinationSlug }),
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
  setGuests: (guests) => set({ guests }),
  clear: () => set(initialState),
}));
