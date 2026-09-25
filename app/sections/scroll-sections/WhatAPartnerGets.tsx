import { ScrollSectionData } from "../../config/content";
import { motion } from "framer-motion";
import { item } from "./core/Reveal";

export default function WhatAPartnerGets() {
  return (
    <>
      <motion.h2
        variants={item}
        className="text-3xl font-medium tracking-tight text-black dark:text-white sm:text-4xl"
      >
        {ScrollSectionData.partner.headline}
      </motion.h2>
      <motion.p variants={item} className="mt-5 leading-relaxed text-black/90 dark:text-white/90">
        {ScrollSectionData.partner.body}
      </motion.p>

      <motion.div
        variants={item}
        className="mt-10 divide-y divide-black/20 dark:divide-gray-900 border-y border-black/40 dark:border-gray-700"
      >
        {ScrollSectionData.partner.items.map((thing) => (
          <div key={thing.title} className="py-5">
            <p className="font-medium text-black/80 dark:text-white/80">{thing.title}</p>
            <p className="mt-1.5 leading-relaxed text-black/60 dark:text-white/60">
              {thing.body}
            </p>
          </div>
        ))}
      </motion.div>
    </>
  );
}
