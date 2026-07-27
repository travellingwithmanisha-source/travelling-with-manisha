import { z } from "zod";

/**
 * Mirrors `BookingType` in schema.prisma. A discriminated union so each
 * branch only requires the fields relevant to that booking type — this
 * is the application-layer twin of the `bookings_target_matches_type_check`
 * DB constraint (see MIGRATION_NOTES.md §3.1): Zod rejects a mismatched
 * payload before it ever reaches Postgres.
 */
const baseBookingFields = {
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  numberOfGuests: z.coerce.number().int().min(1).max(20),
  numberOfUnits: z.coerce.number().int().min(1).default(1),
  specialRequests: z.string().max(1000).optional(),
  couponCode: z.string().max(40).optional(),
};

export const createBookingSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("HOMESTAY"),
      homestayId: z.string().uuid(),
      roomId: z.string().uuid(),
      ...baseBookingFields,
    }),
    z.object({
      type: z.literal("TOUR_PACKAGE"),
      tourPackageId: z.string().uuid(),
      ...baseBookingFields,
    }),
  ])
  .refine((data) => data.endDate > data.startDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
