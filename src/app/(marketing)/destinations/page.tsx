import { listPublishedDestinations } from "@/services/trip.service";
import { EmptyState } from "@/components/shared/empty-state";
import { DestinationSearch } from "@/components/trips/destination-search";

export const dynamic = "force-dynamic"; // reads from the database — see (marketing)/page.tsx for why

export const metadata = { title: "Destinations" };

export default async function DestinationsPage() {
  const destinations = await listPublishedDestinations();

  return (
    <div className="container py-16">
      <h1 className="mb-8 font-display text-3xl font-semibold">Destinations</h1>

      {destinations.length === 0 ? (
        <EmptyState
          title="No destinations published yet"
          description="Check back soon, or ask an admin to publish one from the (admin) dashboard."
        />
      ) : (
        <DestinationSearch destinations={destinations} />
      )}
    </div>
  );
}
