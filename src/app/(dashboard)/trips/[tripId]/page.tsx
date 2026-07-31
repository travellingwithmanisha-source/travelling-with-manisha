import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/services/user.service";
import { prisma } from "@/lib/prisma";
import { BookingSummary } from "@/components/booking/booking-summary";

export const dynamic = "force-dynamic";

// tripId is the Booking id — see the note in app/(dashboard)/trips/page.tsx
// for what "trip" means in this route group.
export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;

  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const user = await getUserBySupabaseId(supabaseUser.id);
  if (!user) redirect("/login");

  const booking = await prisma.booking.findUnique({
    where: { id: tripId },
    include: { homestay: true, tourPackage: true },
  });

  if (!booking || booking.userId !== user.id) {
    notFound();
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl font-semibold">
        {booking.homestay?.name ?? booking.tourPackage?.title}
      </h1>

      <BookingSummary
        title={booking.homestay?.name ?? booking.tourPackage?.title ?? "Booking"}
        startDate={booking.startDate}
        endDate={booking.endDate}
        numberOfGuests={booking.numberOfGuests}
        subtotal={Number(booking.subtotal)}
        discountAmount={Number(booking.discountAmount)}
        taxAmount={Number(booking.taxAmount)}
        totalAmount={Number(booking.totalAmount)}
        currency={booking.currency}
      />
    </div>
  );
}
