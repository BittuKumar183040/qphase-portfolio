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
      <motion.p variants={item} className="mt-5 leading-relaxed text-black dark:text-white/80">
        {ScrollSectionData.verification.body}
      </motion.p>

      <motion.div variants={item} className="mt-10 grid grid-cols-2 gap-3">
        {ScrollSectionData.verification.stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-sm bg-black/10 dark:bg-gray-900/30 border border-black/20 dark:border-gray-800  px-5 py-5 text-black dark:text-white"
          >
            <p className="text-2xl">{stat.value}</p>
            <p className="mt-2 leading-snug opacity-85">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </>
  );
}
