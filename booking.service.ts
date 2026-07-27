import { prisma } from "@/lib/prisma";
import type { CreateBookingInput } from "@/lib/validators/booking.schema";
import { BookingStatus, BookingType } from "@prisma/client";

/**
 * Booking creation/cancellation. This is the most safety-critical service
 * in the app — see DATABASE_DESIGN.md §11 ("Booking Flow") and the
 * AvailabilityCalendar locking-strategy comment in schema.prisma before
 * changing anything here.
 *
 * IMPLEMENTATION STATUS: the availability row-locking transaction
 * (DATABASE_DESIGN.md §11 step 2 — `SELECT ... FOR UPDATE` across the
 * date range, verify, decrement, insert) is NOT yet implemented below.
 * What's here handles the TOUR_PACKAGE path (which doesn't need
 * per-date inventory locking) and stubs the HOMESTAY path with a clear
 * TODO, rather than shipping an unsafe placeholder that *looks* correct
 * and would double-book rooms under concurrent load.
 */

function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TWM-${year}-${random}`;
}

export async function createBooking(userId: string, input: CreateBookingInput) {
  if (input.type === "HOMESTAY") {
    return createHomestayBooking(userId, input);
  }
  return createTourPackageBooking(userId, input);
}

async function createHomestayBooking(
  userId: string,
  input: Extract<CreateBookingInput, { type: "HOMESTAY" }>
) {
  // TODO: wrap in prisma.$transaction, lock the AvailabilityCalendar rows
  // for [startDate, endDate) on input.roomId with a raw
  // `SELECT ... FOR UPDATE`, verify availableUnits >= input.numberOfUnits
  // on every date, then decrement before inserting the Booking — see
  // DATABASE_DESIGN.md §11 step 2. Implementing this without the lock
  // would allow two concurrent requests to both succeed for the same
  // last unit, so this throws rather than silently shipping that bug.
  throw new Error(
    "createHomestayBooking: availability-locking transaction not yet implemented — see TODO in booking.service.ts"
  );

  // Sketch of what the rest of this function will look like once the
  // locking transaction above is in place:
  //
  // const room = await prisma.room.findUniqueOrThrow({ where: { id: input.roomId } });
  // const nights = differenceInCalendarDays(input.endDate, input.startDate);
  // const subtotal = Number(room.basePrice) * nights * input.numberOfUnits;
  // return prisma.booking.create({
  //   data: {
  //     bookingNumber: generateBookingNumber(),
  //     type: BookingType.HOMESTAY,
  //     userId,
  //     homestayId: input.homestayId,
  //     roomId: input.roomId,
  //     startDate: input.startDate,
  //     endDate: input.endDate,
  //     numberOfGuests: input.numberOfGuests,
  //     numberOfUnits: input.numberOfUnits,
  //     status: BookingStatus.PENDING,
  //     subtotal,
  //     totalAmount: subtotal, // + tax - discount, once coupon logic is wired in
  //     currency: room.currency,
  //     specialRequests: input.specialRequests,
  //   },
  // });
}

async function createTourPackageBooking(
  userId: string,
  input: Extract<CreateBookingInput, { type: "TOUR_PACKAGE" }>
) {
  const tourPackage = await prisma.tourPackage.findUniqueOrThrow({
    where: { id: input.tourPackageId },
  });

  // Group-size check (the TourPackage equivalent of availability locking
  // — see DATABASE_DESIGN.md §11 step 7). Not yet transaction-wrapped
  // against a concurrent booking pushing the group over capacity; safe
  // enough for a low-concurrency starter, but the same race-condition
  // caution as the homestay path applies before this handles real load.
  const confirmedGuestCount = await prisma.booking.aggregate({
    where: {
      tourPackageId: input.tourPackageId,
      startDate: input.startDate,
      status: { in: [BookingStatus.PENDING, BookingStatus.AWAITING_PAYMENT, BookingStatus.CONFIRMED] },
      deletedAt: null,
    },
    _sum: { numberOfGuests: true },
  });

  const alreadyBooked = confirmedGuestCount._sum.numberOfGuests ?? 0;
  if (alreadyBooked + input.numberOfGuests > tourPackage.maxGroupSize) {
    throw new Error("This departure date is at capacity.");
  }

  const subtotal = Number(tourPackage.basePrice) * input.numberOfGuests;

  return prisma.booking.create({
    data: {
      bookingNumber: generateBookingNumber(),
      type: BookingType.TOUR_PACKAGE,
      userId,
      tourPackageId: input.tourPackageId,
      startDate: input.startDate,
      endDate: input.endDate,
      numberOfGuests: input.numberOfGuests,
      numberOfUnits: input.numberOfUnits,
      status: BookingStatus.PENDING,
      subtotal,
      totalAmount: subtotal, // + tax - discount, once coupon logic is wired in
      currency: tourPackage.currency,
      specialRequests: input.specialRequests,
    },
  });
}

export async function cancelBooking(userId: string, bookingId: string, reason?: string) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });

  if (booking.userId !== userId) {
    throw new Error("Not authorized to cancel this booking.");
  }
  if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
    throw new Error(`Cannot cancel a booking with status ${booking.status}.`);
  }

  // TODO: if booking.type === HOMESTAY, release the corresponding
  // AvailabilityCalendar rows (increment availableUnits back) in the
  // same transaction — see DATABASE_DESIGN.md §11 step 5. Also TODO:
  // trigger a Refund via payment.service.ts here if the booking has a
  // succeeded Payment and falls within the (not-yet-defined) refund
  // policy window.
  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: reason,
    },
  });
}

export async function getUserBookings(userId: string) {
  return prisma.booking.findMany({
    where: { userId, deletedAt: null },
    include: { homestay: true, tourPackage: true, payments: true },
    orderBy: { createdAt: "desc" },
  });
}
