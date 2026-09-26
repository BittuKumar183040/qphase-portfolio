"use client";

import { motion, Variants } from "framer-motion";
import { item } from "./scroll-sections/core/Reveal";
import { status } from "../config/content";

export interface ProgressStatusItem {
  label: string;
  value: string;
}

type Stage = "Benchmarked" | "RND - Inprogress" | "Upcomming";

function stageFor(value: string): Stage {
  if (value.includes("Benchmarked")) return "Benchmarked";
  if (value.includes("RND - Inprogress")) return "RND - Inprogress";
  return "Upcomming";
}

const STAGE_STYLE: Record<Stage, { dot: string; ring: string; text: string }> = {
  "Benchmarked": {
    dot: "bg-emerald-400",
    ring: "ring-emerald-400/25",
    text: "text-emerald-400",
  },
  "RND - Inprogress": {
    dot: "bg-amber-400",
    ring: "ring-amber-400/25",
    text: "text-amber-400",
  },
  "Upcomming": {
    dot: "bg-gray-300",
    ring: "ring-white/10",
    text: "text-white/40",
  },
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const dotVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 18 },
  },
};

const lineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const ProgressTimeline = () => {
  return (
    <motion.div variants={item} className="w-full bg-black py-12 sm:py-20">
      <motion.ul
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="flex list-none flex-row justify-between gap-4  px-5 sm:px-5 md:px-10 lg:px-20"
      >
        {status.map((entry, index) => {
          const stage = stageFor(entry.value);
          const styles = STAGE_STYLE[stage];

          return (
            <motion.li
              key={entry.label}
              variants={stepVariants}
              className="relative flex shrink-0 flex-col items-center gap-0 text-center sm:flex-1"
            >
              {index > 0 && (
                <motion.span
                  aria-hidden
                  variants={lineVariants}
                  style={{ transformOrigin: "left" }}
                  className="absolute left-0 right-1/2 top-1 h-0.5 w-auto bg-white/15"
                />
              )}

              <motion.span
                variants={dotVariants}
                className="relative z-10 flex size-3 shrink-0 items-center justify-center"
              >
                {stage === "RND - Inprogress" && (
                  <span
                    aria-hidden
                    className={`absolute h-full w-full animate-ping rounded-full opacity-60 ${styles.dot}`}
                  />
                )}
                <span className={`relative size-3 rounded-full ring-4 ${styles.ring} ${styles.dot}`} />
              </motion.span>

              <motion.div variants={textVariants} className="mt-3 sm:mt-4">
                <p className="text-[11px] font-medium leading-tight text-white/80 sm:text-sm">
                  {entry.label}
                </p>
                <p className={`mt-1 text-[9px] font-medium uppercase tracking-wide sm:text-xs ${styles.text}`}>
                  {entry.value}
                </p>
              </motion.div>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.div>
  );
}

export default ProgressTimeline