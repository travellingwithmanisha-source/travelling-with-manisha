import { Hero } from "@/components/marketing/hero";
import { TripCard } from "@/components/trips/trip-card";
import { EmptyState } from "@/components/shared/empty-state";
import { searchHomestays } from "@/services/trip.service";
import { tripSearchSchema } from "@/lib/validators/trip.schema";

// This page reads from the database on every request (via
// searchHomestays), so it must not be statically prerendered at build
// time — `next build` would otherwise try to run this query without a
// guaranteed-migrated database available. Requires `prisma migrate
// deploy` to have been run against DATABASE_URL before this page can
// render successfully.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { items: homestays } = await searchHomestays(tripSearchSchema.parse({}));

  return (
    <>
      <Hero />

      <section className="container pb-20">
        <h2 className="mb-6 font-display text-2xl font-semibold">Featured homestays</h2>

        {homestays.length === 0 ? (
          <EmptyState
            title="No published homestays yet"
            description="Once homestays are approved and published, they'll show up here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {homestays.map((homestay) => (
              <TripCard
                key={homestay.id}
                href={`/destinations/${homestay.destination.slug}/${homestay.slug}`}
                name={homestay.name}
                imageUrl={homestay.coverImageUrl}
                locationLabel={homestay.destination.name}
                startingPrice={homestay.startingPrice ? Number(homestay.startingPrice) : null}
                averageRating={Number(homestay.averageRating)}
                totalReviews={homestay.totalReviews}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
