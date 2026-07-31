import { Skeleton } from "@/components/ui/skeleton";

export default function DestinationsLoading() {
  return (
    <div className="container py-16">
      <Skeleton className="mb-8 h-9 w-56" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
