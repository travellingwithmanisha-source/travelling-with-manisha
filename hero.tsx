import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Homepage hero — deliberately plain copy/layout for now. This is
 * scaffolding, not the final marketing design; give it a real design
 * pass (see the frontend-design guidance on avoiding templated defaults)
 * once there's real photography/copy to design around, rather than
 * polishing placeholder content.
 */
export function Hero() {
  return (
    <section className="container flex flex-col items-center gap-6 py-20 text-center md:py-32">
      <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
        Homestays and journeys, planned around real places.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Browse curated homestays and guided tours, see the full itinerary on
        a map before you book, and pay in the currency that works for you.
      </p>
      <div className="flex gap-3">
        <Button size="lg" asChild>
          <Link href="/destinations">Browse destinations</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/about">How it works</Link>
        </Button>
      </div>
    </section>
  );
}
