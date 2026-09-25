// Reveal.tsx
// Shared motion variants so every section animates in the same considered way:
// one small stagger as the section enters the viewport, not a different
// effect per component. Import { container, item } and apply to motion.*
// elements — the parent gets `container`, each direct child gets `item`.

import type { Variants } from "framer-motion";

export const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.04,
    },
  },
};

export const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const heroSectionItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
  },
};

// Standard viewport settings for whileInView: trigger once, a little before
// the section is fully on screen so the motion reads as "arriving", not late.
export const viewport = { once: false, amount: 0.3 } as const;
