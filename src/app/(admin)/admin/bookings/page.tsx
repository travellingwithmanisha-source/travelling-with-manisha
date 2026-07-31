import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDateRange } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Bookings" };

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    where: { deletedAt: null },
    include: { user: true, homestay: true, tourPackage: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

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
                <th className="p-3">Traveler</th>
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
                  <td className="p-3">
                    {booking.user.firstName} {booking.user.lastName}
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
