import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-hero overflow-hidden bg-ink">
      {/* Ambient brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-purple-500/20 blur-6xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-pink-500/10 blur-6xl"
      />

      <div className="container relative z-raised flex min-h-hero items-center py-20">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center rounded-pill border border-white/10 bg-white/[0.06] px-4 py-2 text-caption uppercase text-white/70 backdrop-blur-md">
            Travel differently
          </div>

          {/* Main headline */}
          <h1 className="font-heading text-display-lg font-bold tracking-tight text-text-primary sm:text-display-xl lg:text-display-2xl">
            Go beyond the
            <span className="block bg-text-gradient bg-clip-text text-transparent">
              ordinary.
            </span>
          </h1>

          {/* Supporting copy */}
          <p className="mt-6 max-w-2xl font-body text-body-lg text-text-secondary">
            Discover unforgettable journeys, hidden gems, meaningful
            connections, and adventures that become lifelong stories.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/trips">Explore journeys</Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/about">Our story</Link>
            </Button>
          </div>

          {/* Small reassurance */}
          <p className="mt-6 text-body-sm text-text-muted">
            Curated adventures • Real experiences • Meaningful connections
          </p>
        </div>
      </div>
    </section>
  );
}