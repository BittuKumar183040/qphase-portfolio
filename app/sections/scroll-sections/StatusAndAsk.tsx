import { ScrollSectionData } from "../../config/content";
import { motion } from "framer-motion";
import { item } from "./core/Reveal";

export default function StatusAndAsk() {
  return (
    <>
      <motion.h2
        variants={item}
        className="text-3xl font-medium tracking-tight text-black dark:text-white sm:text-4xl"
      >
        {ScrollSectionData.statusAndAsk.headline}
      </motion.h2>

      <div className="mt-8 space-y-4">
        {ScrollSectionData.statusAndAsk.bodyParagraphs.map((p) => (
          <motion.p
            key={p}
            variants={item}
            className="leading-relaxed  text-black/60 dark:text-white/60"
          >
            {p}
          </motion.p>
        ))}
      </div>

      <motion.div
        variants={item}
        className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3"
      >
        {ScrollSectionData.statusAndAsk.status.map((s) => (
          <div
            key={s.label}
            className="border border-black/10 px-4 py-4 dark:border-white/10"
          >
            <p className="text-xs text-black/50 dark:text-white/50 sm:text-sm">
              {s.label}
            </p>
            <p className="mt-1 text-sm font-medium text-black dark:text-white sm:text-base">
              {s.value}
            </p>
          </div>
        ))}
      </motion.div>
    </>
  );
}
