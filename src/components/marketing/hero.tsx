"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerChildren } from "@/styles/motion";

/**
 * Homepage hero — deliberately plain copy/layout for now. This is
 * scaffolding, not the final marketing design; give it a real design
 * pass (see the frontend-design guidance on avoiding templated defaults)
 * once there's real photography/copy to design around, rather than
 * polishing placeholder content.
 *
 * Client component (rather than the server component it was originally)
 * because `framer-motion`'s `motion.*` components require it — this is
 * the one place in `(marketing)` that needs the client boundary; the
 * route group's page and layout around it stay server components.
 */
export function Hero() {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerChildren}
      className="container flex flex-col items-center gap-6 py-20 text-center md:py-32"
    >
      <motion.h1
        variants={fadeInUp}
        className="max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-6xl"
      >
        Homestays and journeys, planned around real places.
      </motion.h1>
      <motion.p variants={fadeInUp} className="max-w-xl text-lg text-muted-foreground">
        Browse curated homestays and guided tours, see the full itinerary on
        a map before you book, and pay in the currency that works for you.
      </motion.p>
      <motion.div variants={fadeInUp} className="flex gap-3">
        <Button size="lg" asChild>
          <Link href="/destinations">Browse destinations</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/about">How it works</Link>
        </Button>
      </motion.div>
    </motion.section>
  );
}
