import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/services/user.service";
import { getUserBookings } from "@/services/booking.service";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDateRange } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings" };

/**
 * Distinct from `(dashboard)/trips`: this is a flatter, table-style view
 * geared at managing bookings (status, payment, cancellation) rather than
 * browsing them as trips. Both currently read the same
 * `getUserBookings` — split them further (e.g. add filters here) once
 * there's a concrete reason to.
 */
export default async function BookingsPage() {
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
      <h1 className="font-display text-2xl font-semibold">Bookings</h1>

      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Booking</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="p-3">
                    <div className="font-medium">{booking.bookingNumber}</div>
                    <div className="text-muted-foreground">
                      {booking.homestay?.name ?? booking.tourPackage?.title}
                    </div>
                  </td>
                  <td className="p-3">{formatDateRange(booking.startDate, booking.endDate)}</td>
                  <td className="p-3">{booking.status}</td>
                  <td className="p-3 text-right">
                    {formatCurrency(Number(booking.totalAmount), booking.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
