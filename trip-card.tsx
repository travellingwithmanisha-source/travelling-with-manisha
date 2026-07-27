import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export interface TripCardProps {
  href: string;
  name: string;
  imageUrl: string | null;
  locationLabel: string;
  startingPrice: number | null;
  currency?: string;
  averageRating: number;
  totalReviews: number;
}

/**
 * Generic listing card for both Homestays and TourPackages — the two
 * types share enough display fields (name, cover image, starting price,
 * rating) that a single card component covers both, with the caller
 * responsible for supplying the right `href` and `locationLabel`.
 */
export function TripCard({
  href,
  name,
  imageUrl,
  locationLabel,
  startingPrice,
  currency = "INR",
  averageRating,
  totalReviews,
}: TripCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-[4/3] w-full bg-muted">
          {imageUrl ? (
            <Image src={imageUrl} alt={name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No image yet
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{name}</CardTitle>
          <p className="text-sm text-muted-foreground">{locationLabel}</p>
        </CardHeader>
        <CardContent className="pb-2">
          {totalReviews > 0 ? (
            <p className="text-sm">
              ★ {averageRating.toFixed(1)}{" "}
              <span className="text-muted-foreground">({totalReviews})</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet</p>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm font-medium">
            {startingPrice !== null ? (
              <>from {formatCurrency(startingPrice, currency)}</>
            ) : (
              <span className="text-muted-foreground">Price on request</span>
            )}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
