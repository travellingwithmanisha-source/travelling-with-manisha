/**
 * prisma/seed.ts
 *
 * Local/dev seed script — run via `npm run db:seed` (see package.json,
 * which should already wire this up via `prisma.seed` in its config, e.g.:
 *   "prisma": { "seed": "tsx prisma/seed.ts" }
 *
 * This is intentionally minimal: enough reference data (one destination,
 * one homestay owner, one published homestay with a room) to exercise the
 * booking flow locally without needing real Cloudinary/Stripe/Razorpay
 * credentials. Extend as features land — do not treat this as production
 * data.
 */

import { PrismaClient, Role, HomestayStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      email: "owner@example.com",
      firstName: "Asha",
      lastName: "Rao",
      role: Role.HOMESTAY_OWNER,
      isEmailVerified: true,
    },
  });

  const destination = await prisma.destination.upsert({
    where: { slug: "coorg" },
    update: {},
    create: {
      name: "Coorg",
      slug: "coorg",
      country: "India",
      state: "Karnataka",
      description: "Coffee estates, misty hills, and waterfalls in the Western Ghats.",
      isActive: true,
    },
  });

  const homestay = await prisma.homestay.upsert({
    where: { slug: "misty-hills-coorg" },
    update: {},
    create: {
      ownerId: owner.id,
      destinationId: destination.id,
      name: "Misty Hills Homestay",
      slug: "misty-hills-coorg",
      description: "A family-run homestay on a working coffee estate.",
      address: "Madikeri, Kodagu, Karnataka",
      amenities: ["Wi-Fi", "Home-cooked meals", "Estate walks"],
      houseRules: ["No smoking indoors", "Quiet hours after 10pm"],
      checkInTime: "14:00",
      checkOutTime: "11:00",
      status: HomestayStatus.PUBLISHED,
    },
  });

  await prisma.room.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      homestayId: homestay.id,
      name: "Garden View Room",
      roomType: "Private Room",
      maxOccupancy: 2,
      basePrice: 3500,
      currency: "INR",
      totalUnits: 2,
      amenities: ["Attached bathroom", "Balcony"],
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
