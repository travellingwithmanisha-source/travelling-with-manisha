import { create } from "zustand";

/**
 * Client-side state for the multi-step booking wizard (select dates ->
 * select room/guests -> review -> pay). Deliberately holds only
 * in-progress, not-yet-submitted selections — once a booking is actually
 * created it becomes a server-owned `Booking` row, fetched normally via
 * `booking.service.ts`, not tracked here.
 */
interface BookingWizardState {
  step: number;
  homestayId: string | null;
  roomId: string | null;
  tourPackageId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  numberOfGuests: number;
  couponCode: string | null;

  setDates: (startDate: Date | null, endDate: Date | null) => void;
  setHomestaySelection: (homestayId: string, roomId: string) => void;
  setTourPackageSelection: (tourPackageId: string) => void;
  setGuests: (count: number) => void;
  setCouponCode: (code: string | null) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
}

const initialState = {
  step: 1,
  homestayId: null,
  roomId: null,
  tourPackageId: null,
  startDate: null,
  endDate: null,
  numberOfGuests: 1,
  couponCode: null,
} satisfies Partial<BookingWizardState>;

export const useBookingWizardStore = create<BookingWizardState>((set) => ({
  ...initialState,

  setDates: (startDate, endDate) => set({ startDate, endDate }),
  setHomestaySelection: (homestayId, roomId) => set({ homestayId, roomId, tourPackageId: null }),
  setTourPackageSelection: (tourPackageId) => set({ tourPackageId, homestayId: null, roomId: null }),
  setGuests: (numberOfGuests) => set({ numberOfGuests }),
  setCouponCode: (couponCode) => set({ couponCode }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  previousStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  reset: () => set(initialState),
}));
