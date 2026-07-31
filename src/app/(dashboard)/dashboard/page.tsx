import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/services/user.service";
import { getUserBookings } from "@/services/booking.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const user = await getUserBySupabaseId(supabaseUser.id);
  if (!user) redirect("/login");

  const bookings = await getUserBookings(user.id);
  const upcoming = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Welcome back, {user.firstName}</h1>
        <p className="text-muted-foreground">Here's what's coming up.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming trips</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <EmptyState
              title="No upcoming trips"
              description="Once you book a homestay or tour package, it'll show up here."
              action={
                <Button asChild>
                  <Link href="/destinations">Browse destinations</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y">
              {upcoming.map((booking) => (
                <li key={booking.id} className="flex items-center justify-between py-3 text-sm">
                  <span>{booking.homestay?.name ?? booking.tourPackage?.title}</span>
                  <span className="text-muted-foreground">{booking.status}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
