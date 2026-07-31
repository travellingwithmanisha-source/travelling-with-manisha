import type { Variants } from "framer-motion";

/**
 * Shared animation variants. `framer-motion` is in the stack per
 * README.md but wasn't imported anywhere until this audit pass — centralizing
 * variants here instead of inlining ad-hoc objects per component keeps
 * motion consistent (same easing/duration everywhere) as more of the UI
 * adopts it.
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const staggerChildren: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};
