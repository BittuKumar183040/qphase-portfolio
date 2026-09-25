import { ScrollSectionData } from "../../config/content";
import { motion } from "framer-motion";
import { item } from "./core/Reveal";

export default function DataMeasuredNotModeled() {
  return (
    <>
      <motion.h2
        variants={item}
        className="text-3xl font-medium tracking-tight text-black dark:text-white sm:text-4xl"
      >
        {ScrollSectionData.dataSection.headline}
      </motion.h2>

      <div className="mt-8 space-y-4">
        {ScrollSectionData.dataSection.bodyParagraphs.map((p) => (
          <motion.p
            key={p}
            variants={item}
            className="leading-relaxed  text-black/80 dark:text-white/80"
          >
            {p}
          </motion.p>
        ))}
      </div>

      <motion.dl
        variants={item}
        className="mt-10 divide-y divide-black/20 dark:divide-gray-900 border-y border-black/20 dark:border-gray-800"
      >
        {ScrollSectionData.dataSection.logRows.map((row) => (
          <div
            key={row.key}
            className="flex items-baseline justify-between gap-6 py-3"
          >
            <dt className="tracking-wide  text-black/80 dark:text-white/80">{row.key}</dt>
            <dd className="text-right  text-black/60 dark:text-white/60">{row.value}</dd>
          </div>
        ))}
      </motion.dl>
    </>
  );
}
