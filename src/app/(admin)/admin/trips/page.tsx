import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Trips" };

/**
 * "Trips" mirrors the traveler-facing naming (see the note in
 * `(dashboard)/trips/page.tsx`) but here means the two listing types
 * admins manage — Homestay and TourPackage — not bookings. Starting with
 * the approval queue (PENDING_APPROVAL status) since that's the one
 * admin-specific action neither owners nor travelers can do themselves.
 */
export default async function AdminTripsPage() {
  const [pendingHomestays, pendingTourPackages] = await Promise.all([
    prisma.homestay.findMany({
      where: { status: "PENDING_APPROVAL", deletedAt: null },
      include: { owner: true, destination: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.tourPackage.findMany({
      where: { status: "PENDING_APPROVAL", deletedAt: null },
      include: { destination: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const isEmpty = pendingHomestays.length === 0 && pendingTourPackages.length === 0;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold">Pending approvals</h1>

      {isEmpty ? (
        <EmptyState title="Nothing waiting for review" />
      ) : (
        <>
          {pendingHomestays.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
                Homestays
              </h2>
              <ul className="divide-y rounded-lg border">
                {pendingHomestays.map((homestay) => (
                  <li key={homestay.id} className="flex items-center justify-between p-4 text-sm">
                    <div>
                      <p className="font-medium">{homestay.name}</p>
                      <p className="text-muted-foreground">
                        {homestay.destination.name} · owner: {homestay.owner.firstName}{" "}
                        {homestay.owner.lastName}
                      </p>
                    </div>
                    {/* TODO: approve/reject actions once a Server Action
                        for status transitions + AuditLog write exists. */}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {pendingTourPackages.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
                Tour packages
              </h2>
              <ul className="divide-y rounded-lg border">
                {pendingTourPackages.map((tourPackage) => (
                  <li key={tourPackage.id} className="flex items-center justify-between p-4 text-sm">
                    <div>
                      <p className="font-medium">{tourPackage.title}</p>
                      <p className="text-muted-foreground">{tourPackage.destination.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
