"use client";

import { motion } from "framer-motion";
import { item } from "./scroll-sections/core/Reveal";

export interface ProgressStatusItem {
  label: string;
  value: string;
}

type Stage = "done" | "progress" | "upcoming";

/** Classifies a status value into a stage purely by keyword — works with whatever wording your
 * data uses ("Benchmarked", "RND - Inprogress", "Upcomming", ...), no exact-match required. */
function stageFor(value: string): Stage {
  const v = value.toLowerCase();
  if (v.includes("bench") || v.includes("done") || v.includes("complete")) return "done";
  if (v.includes("progress") || v.includes("rnd") || v.includes("r&d")) return "progress";
  return "upcoming";
}

// Colors are fixed, not theme-conditional — this component always sits on a bg-black
// surface, regardless of the site's light/dark mode, so it needs one palette, not two.
const STAGE_STYLE: Record<Stage, { dot: string; ring: string; text: string }> = {
  done: {
    dot: "bg-emerald-400",
    ring: "ring-emerald-400/25",
    text: "text-emerald-400",
  },
  progress: {
    dot: "bg-amber-400",
    ring: "ring-amber-400/25",
    text: "text-amber-400",
  },
  upcoming: {
    dot: "bg-white/20",
    ring: "ring-white/10",
    text: "text-white/40",
  },
};

// Same shape/content as the `status` array you shared — used as the default so the component
// renders correctly with no props. Pass your own `items` to override.
const DEFAULT_ITEMS: ProgressStatusItem[] = [
  { label: "Supercondicated *", value: "Benchmarked" },
  { label: "Photonic *", value: "RND - Inprogress" },
  { label: "Netural Atom *", value: "Upcomming" },
];

export default function ProgressTimeline({
  items = DEFAULT_ITEMS,
}: {
  items?: ProgressStatusItem[];
}) {
  return (
    <motion.div variants={item} className="w-full bg-black py-20">
      <ol className="flex list-none flex-col gap-8 sm:flex-row sm:gap-0">
        {items.map((entry, index) => {
          const stage = stageFor(entry.value);
          const styles = STAGE_STYLE[stage];

          return (
            <li
              key={entry.label}
              className="relative flex flex-1 items-start gap-4 sm:flex-col sm:items-center sm:gap-0 sm:text-center"
            >
              {/* incoming connector — each step (after the first) draws the line leading in to it,
                  vertical on mobile / horizontal from sm: up. 7px == half of the dot's 14px (size-3.5). */}
              {index > 0 && (
                <span
                  aria-hidden
                  className="absolute bottom-1/2 left-[7px] top-0 w-px bg-white/15 sm:bottom-auto sm:left-0 sm:right-1/2 sm:top-[7px] sm:h-px sm:w-auto"
                />
              )}

              {/* dot */}
              <span className="relative z-10 flex size-3.5 shrink-0 items-center justify-center">
                {stage === "progress" && (
                  <span
                    aria-hidden
                    className={`absolute h-full w-full animate-ping rounded-full opacity-60 ${styles.dot}`}
                  />
                )}
                <span className={`relative size-3.5 rounded-full ring-4 ${styles.ring} ${styles.dot}`} />
              </span>

              <div className="sm:mt-4">
                <p className="text-sm font-medium text-white/80">{entry.label}</p>
                <p className={`mt-1 text-xs font-medium uppercase tracking-wide ${styles.text}`}>
                  {entry.value}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </motion.div>
  );
}