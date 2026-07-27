import { z } from "zod";

/**
 * "Trip" here covers the two browsable/bookable listing types —
 * Homestay and TourPackage — wherever a schema is generic enough to
 * apply to both (search/filtering). Type-specific creation schemas are
 * split out below since their fields genuinely differ.
 */

export const tripSearchSchema = z.object({
  destinationSlug: z.string().optional(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  guests: z.coerce.number().int().min(1).max(20).default(1),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type TripSearchInput = z.infer<typeof tripSearchSchema>;

export const createHomestaySchema = z.object({
  destinationId: z.string().uuid(),
  name: z.string().min(3).max(120),
  description: z.string().max(5000).optional(),
  address: z.string().min(5).max(300),
  amenities: z.array(z.string()).default([]),
  houseRules: z.array(z.string()).default([]),
  checkInTime: z.string().regex(/^\d{2}:\d{2}$/, "Use 24h HH:mm"),
  checkOutTime: z.string().regex(/^\d{2}:\d{2}$/, "Use 24h HH:mm"),
});
export type CreateHomestayInput = z.infer<typeof createHomestaySchema>;

export const createRoomSchema = z.object({
  homestayId: z.string().uuid(),
  name: z.string().min(2).max(120),
  roomType: z.string().min(2).max(60),
  maxOccupancy: z.coerce.number().int().min(1).max(20),
  basePrice: z.coerce.number().positive(),
  currency: z.string().length(3).default("INR"),
  totalUnits: z.coerce.number().int().min(1).default(1),
  amenities: z.array(z.string()).default([]),
});
export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export const createTourPackageSchema = z.object({
  destinationId: z.string().uuid(),
  title: z.string().min(3).max(150),
  description: z.string().max(5000).optional(),
  durationDays: z.coerce.number().int().min(1),
  durationNights: z.coerce.number().int().min(0),
  basePrice: z.coerce.number().positive(),
  currency: z.string().length(3).default("INR"),
  maxGroupSize: z.coerce.number().int().min(1),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
});
export type CreateTourPackageInput = z.infer<typeof createTourPackageSchema>;
