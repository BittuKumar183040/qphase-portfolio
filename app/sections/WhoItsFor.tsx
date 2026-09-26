"use client";

import { motion, Variants } from "framer-motion";

import HorizontalEntity from "../components/HorizontalEntity";
import MediaReveal from "../components/ui/MediaReveal";
import { eyebrow, heading, subHeading, WHO_ITS_FOR } from "../config/whoItsFor";
import WhatAPartnerGets from "./scroll-sections/WhatAPartnerGets";

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const reveal: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function WhoItsFor() {
  return (
    <section
      id="who-its-for"
      className="relative w-full bg-white py-24 text-black dark:bg-black dark:text-white"
    >
      {/* Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.div variants={reveal} className="mb-5 flex items-center gap-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/50 dark:text-white/50">
            {eyebrow}
          </span>

          <span className="h-px w-10 bg-black/20 dark:bg-white/20" />
        </motion.div>

        <motion.h2
          variants={reveal}
          className="max-w-3xl text-4xl font-medium leading-[1.04] tracking-tight text-black dark:text-white sm:text-5xl lg:text-6xl"
        >
          {heading.line1} {" "}
          <span className="text-[#733d22]">{heading.line2}</span>
        </motion.h2>

        <motion.p
          variants={reveal}
          className="mt-6 max-w-2xl text-base leading-relaxed text-black/60 dark:text-white/60 sm:text-lg"
        >
          {subHeading}
        </motion.p>
      </motion.div>

      {/* List */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
        className="mt-14 flex flex-col divide-y divide-black/10 border-y border-black/10 pl-6 dark:divide-white/10 dark:border-white/10"
      >
        {WHO_ITS_FOR.map((entity, index) => (
          <MediaReveal
            src={entity.hoveredContentURL}
            type={entity.mediaType}
            key={entity.title}
          >
            <HorizontalEntity
              title={entity.title}
              desc={entity.desc}
              index={index}
            />
          </MediaReveal>
        ))}
      </motion.div>
      <WhatAPartnerGets/>
      
    </section>
  );
}