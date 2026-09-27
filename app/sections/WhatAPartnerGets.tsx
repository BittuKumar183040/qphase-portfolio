"use client";

import { motion, Variants } from "framer-motion";

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

const partner = {
  eyebrow: "FOR PARTNERS",
  heading: {
    line1: "What a partner",
    line2: "actually gets",
  },
  body: "Not a benchmark slide — a compiler you can point at your own circuits and trust the number that comes back.",
  items: [
    {
      title: "A fidelity number you can defend",
      body: "Every result ships with the Broker's verification trace, not just a pass/fail.",
    },
    {
      title: "One integration, several backends",
      body: "Target any supported chip from the same Circuit IR without re-validating your pipeline each time.",
    },
    {
      title: "An explicit error bound past exact simulation",
      body: "MPS scaling keeps verification honest even when circuits outgrow exact methods.",
    },
    {
      title: "Disclosure, not rounding",
      body: "Backend limits — like the photonic path's 5-qubit ceiling — are stated upfront.",
    },
  ],
};

export default function WhatAPartnerGets() {
  const { eyebrow, heading, body, items } = partner;
 
  return (
    <div className="mt-24">
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
          {body}
        </motion.p>
      </motion.div>
 
      {/* List */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
        className="mt-14 flex flex-col divide-y divide-black/10 border-y border-black/10 dark:divide-white/10 dark:border-white/10"
      >
        {items.map((thing) => (
          <motion.div variants={reveal} key={thing.title} className="py-6">
            <p className="font-medium text-black/80 dark:text-white/80">{thing.title}</p>
            <p className="mt-1.5 max-w-2xl leading-relaxed text-black/60 dark:text-white/60">
              {thing.body}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}