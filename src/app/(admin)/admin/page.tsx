import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  const [homestayCount, tourPackageCount, bookingCount, userCount] = await Promise.all([
    prisma.homestay.count({ where: { deletedAt: null } }),
    prisma.tourPackage.count({ where: { deletedAt: null } }),
    prisma.booking.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
  ]);

  const stats = [
    { label: "Homestays", value: homestayCount },
    { label: "Tour packages", value: tourPackageCount },
    { label: "Bookings", value: bookingCount },
    { label: "Users", value: userCount },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Overview</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
