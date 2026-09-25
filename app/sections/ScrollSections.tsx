"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { navItems, ScrollSectionData } from "../config/content";
import Layout from "./scroll-sections/core/scroll-layout";
import {
  ScrollControllerProvider,
  useScrollController,
} from "./scroll-sections/core/scroll-controller";
import ScrollItems from "./scroll-sections/core/ScrollItems";

const ids = navItems.map((n) => n.id);

const dissolveVariants = {
  enter: { opacity: 0, filter: "blur(8px)", y: 28 },
  center: { opacity: 1, filter: "blur(0px)", y: 0 },
  exit: { opacity: 0, filter: "blur(10px)", y: -28 },
};

function ScrollStage() {
  const { activeId, isAnimating, rootRef } = useScrollController();
  const reduceMotion = useReducedMotion();
  const data = ScrollSectionData[activeId as keyof typeof ScrollSectionData];

  const transition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div
      ref={rootRef}
      // `h-dvh` is the fallback for the brief instant before the
      // ScrollControllerProvider effect sets --app-vh (or if JS is
      // disabled); once set, --app-vh is the source of truth and doesn't
      // suffer from mobile browsers' dvh-recalculation lag. See the
      // viewport-var effect in scroll-controller.tsx for why.
      style={{ height: "var(--app-vh, 100dvh)" }}
      className="relative w-full overflow-hidden bg-white dark:bg-black text-black dark:text-white antialiased"
    >
      {/* Brief scanline sweep on every hop — the "digital dissolve" cue
          standing in for a literal matrix-rain effect (kept in the deck's
          own cream/terracotta palette instead of green code-rain). */}
      {!reduceMotion && (
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              key="scan"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="pointer-events-none fixed inset-0 z-30"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(140,74,42,0.08) 3px, transparent 4px)",
              }}
            />
          )}
        </AnimatePresence>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          variants={dissolveVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="absolute inset-0"
        >
          <Layout id={activeId}>{data?.component}</Layout>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const ScrollSections = () => {
  return (
    <ScrollControllerProvider ids={ids}>
      <ScrollStage />
      <ScrollItems />
    </ScrollControllerProvider>
  );
};

export default ScrollSections;