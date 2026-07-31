import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/services/user.service";
import { getUserBookings } from "@/services/booking.service";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateRange } from "@/lib/utils";

/**
 * "Trips" here means the traveler's own bookings, viewed as trips they're
 * taking (as opposed to `(admin)/admin/bookings`, which is every
 * booking on the platform). `ARCHITECTURE.md` doesn't define a separate
 * `Trip` model — there isn't one in schema.prisma — so this reads
 * directly from `Booking` via booking.service.ts. Rename this route if a
 * different meaning was intended.
 */
export const dynamic = "force-dynamic";
export const metadata = { title: "My Trips" };

export default async function TripsPage() {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const user = await getUserBySupabaseId(supabaseUser.id);
  if (!user) redirect("/login");

  const bookings = await getUserBookings(user.id);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">My trips</h1>

      {bookings.length === 0 ? (
        <EmptyState
          title="No trips yet"
          description="Bookings you make will show up here."
          action={
            <Button asChild>
              <Link href="/destinations">Browse destinations</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/trips/${booking.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">
                    {booking.homestay?.name ?? booking.tourPackage?.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatDateRange(booking.startDate, booking.endDate)}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{booking.status}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
