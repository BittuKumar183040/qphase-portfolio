import { motion } from "framer-motion";
import { item } from "./core/Reveal";
import { ScrollSectionData } from "@/app/config/content";

export default function ProofPointVerification() {
  return (
    <>
      <motion.h2
        variants={item}
        className="text-3xl font-medium tracking-tight text-black dark:text-white sm:text-4xl"
      >
        {ScrollSectionData.verification.headline}
      </motion.h2>
      <motion.p
        variants={item}
        className="mt-5 leading-relaxed text-black dark:text-white/80"
      >
        {ScrollSectionData.verification.body}
      </motion.p>

      <motion.div
        variants={item}
        className="mt-10 grid grid-cols-2 gap-2.5 sm:gap-3"
      >
        {ScrollSectionData.verification.stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-sm border border-black/10 bg-black/3 px-4 py-4 text-black dark:border-white/10 dark:bg-white/5 dark:text-white sm:px-5 sm:py-5"
          >
            <p className="text-lg font-medium tracking-tight sm:text-xl lg:text-2xl">
              {stat.value}
            </p>
            <p className="mt-2 text-xs leading-snug text-black/60 dark:text-white/60 sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>
    </>
  );
}
