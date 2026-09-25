import { ScrollSectionData } from "../../config/content";
import { motion } from "framer-motion";
import { item } from "./core/Reveal";

export default function ProofPointCrossPlatform() {
  return (
    <>
      <motion.h2
        variants={item}
        className="text-3xl font-medium tracking-tight text-black dark:text-white sm:text-4xl"
      >
        {ScrollSectionData.crossPlatform.headline}
      </motion.h2>
      <motion.p variants={item} className="mt-5 leading-relaxed text-black/80 dark:text-white/80">
        {ScrollSectionData.crossPlatform.body}
      </motion.p>

      <motion.div
        variants={item}
        className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-white dark:bg-gray-900/40 sm:grid-cols-2"
      >
        {ScrollSectionData.crossPlatform.backends.map((b) => (
          <div key={b.name} className="bg-black/10 dark:bg-gray-900/30 px-5 py-4">
            <p className="font-medium text-black/80 dark:text-white/80">{b.name}</p>
            <p className="mt-1  text-black/60 dark:text-white/60">{b.detail}</p>
          </div>
        ))}
      </motion.div>
    </>
  );
}
