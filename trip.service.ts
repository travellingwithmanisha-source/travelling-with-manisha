import { prisma } from "@/lib/prisma";
import type { TripSearchInput, CreateHomestayInput } from "@/lib/validators/trip.schema";
import { HomestayStatus, TourPackageStatus, type Prisma } from "@prisma/client";
import type { PaginatedResult } from "@/types";

/**
 * Business logic for browsing/searching Homestays and TourPackages.
 * Route handlers (`app/api/trips/**`) and Server Components call these —
 * never query Prisma directly from a route handler, per
 * `ARCHITECTURE.md`'s "route handlers stay thin" convention.
 */

export async function searchHomestays(
  input: TripSearchInput
): Promise<PaginatedResult<Prisma.HomestayGetPayload<{ include: { destination: true } }>>> {
  const where: Prisma.HomestayWhereInput = {
    status: HomestayStatus.PUBLISHED,
    deletedAt: null,
    ...(input.destinationSlug && {
      destination: { slug: input.destinationSlug },
    }),
    ...(input.minPrice !== undefined || input.maxPrice !== undefined
      ? {
          startingPrice: {
            ...(input.minPrice !== undefined && { gte: input.minPrice }),
            ...(input.maxPrice !== undefined && { lte: input.maxPrice }),
          },
        }
      : {}),
    // TODO: filter by actual room availability for input.checkIn/checkOut
    // once the availability-check helper lands (see DATABASE_DESIGN.md
    // §11 step 1) — for now, search only filters on static listing
    // fields, not live availability.
  };

  const [items, totalCount] = await Promise.all([
    prisma.homestay.findMany({
      where,
      include: { destination: true },
      orderBy: { averageRating: "desc" },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.homestay.count({ where }),
  ]);

  return {
    items,
    page: input.page,
    pageSize: input.pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / input.pageSize)),
  };
}

export async function getHomestayBySlug(slug: string) {
  return prisma.homestay.findFirst({
    where: { slug, status: HomestayStatus.PUBLISHED, deletedAt: null },
    include: {
      destination: true,
      rooms: { where: { isActive: true } },
      reviews: { where: { isApproved: true }, take: 10, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function searchTourPackages(input: TripSearchInput) {
  const where: Prisma.TourPackageWhereInput = {
    status: TourPackageStatus.PUBLISHED,
    deletedAt: null,
    ...(input.destinationSlug && { destination: { slug: input.destinationSlug } }),
  };

  const [items, totalCount] = await Promise.all([
    prisma.tourPackage.findMany({
      where,
      include: { destination: true },
      orderBy: { averageRating: "desc" },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.tourPackage.count({ where }),
  ]);

  return {
    items,
    page: input.page,
    pageSize: input.pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / input.pageSize)),
  };
}

export async function getTourPackageBySlug(slug: string) {
  return prisma.tourPackage.findFirst({
    where: { slug, status: TourPackageStatus.PUBLISHED, deletedAt: null },
    include: {
      destination: true,
      itineraryDays: { orderBy: { dayNumber: "asc" } },
      reviews: { where: { isApproved: true }, take: 10, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function listPublishedDestinations() {
  return prisma.destination.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { name: "asc" },
  });
}

/**
 * Creates a DRAFT homestay for an owner. Publishing (DRAFT ->
 * PENDING_APPROVAL -> PUBLISHED) is a separate, admin-reviewed step —
 * intentionally not part of this function. See `HomestayStatus` in
 * schema.prisma for the full lifecycle.
 */
export async function createHomestayDraft(ownerId: string, input: CreateHomestayInput) {
  return prisma.homestay.create({
    data: {
      ownerId,
      destinationId: input.destinationId,
      name: input.name,
      slug: slugify(input.name),
      description: input.description,
      address: input.address,
      amenities: input.amenities,
      houseRules: input.houseRules,
      checkInTime: input.checkInTime,
      checkOutTime: input.checkOutTime,
      status: HomestayStatus.DRAFT,
    },
  });
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}
