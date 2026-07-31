/**
 * Shared types used across the app. Domain shapes are re-exported
 * directly from the Prisma client rather than hand-duplicated — Prisma
 * generates these from schema.prisma, so they're always in sync with the
 * database. Add UI-only types (props, view-model shapes) below the
 * re-exports, not domain fields that belong in schema.prisma instead.
 */
export type {
  User,
  Homestay,
  Room,
  AvailabilityCalendar,
  Destination,
  TourPackage,
  Itinerary,
  Booking,
  Payment,
  Refund,
  Review,
  WishlistItem,
  Coupon,
  Notification,
  Blog,
  Role,
  BookingType,
  BookingStatus,
  HomestayStatus,
  TourPackageStatus,
  PaymentStatus,
  RefundStatus,
} from "@prisma/client";

/** Standard shape for JSON API responses across `app/api/**`. */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/** Generic paginated-list response shape. */
export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
