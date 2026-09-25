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

const verification = {
    eyebrow: "VERIFICATION",
    heading: {
      line1: "Proof, not",
      line2: "a promise",
    },
    body: "13 real benchmark circuits, compiled cross-checked between in-house noise simulator and super conductive emulator.",
    stats: [
      {
        value: "13/13",
        label: "Broker-verified vs. real quantum emulator",
      },
      {
        value: "0.934",
        label: "Mean fidelity agreement across circuits",
      },
      {
        value: "4–10",
        label: "Qubit range actually measured",
      },
      {
        value: "4,096",
        label: "Shots per circuit, every run",
      },
    ],
  }

export default function ProofPointVerification() {
  const { eyebrow, heading, body, stats } = verification;

  return (
    <div className="p-5 sm:p-10 md:p-20">
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

      {/* Stats grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
        className="mt-14 grid grid-cols-2 gap-2.5 sm:gap-3"
      >
        {stats.map((stat) => (
          <motion.div
            variants={reveal}
            key={stat.label}
            className="rounded-sm border border-black/10 bg-black/3 px-4 py-4 text-black dark:border-white/10 dark:bg-white/5 dark:text-white sm:px-5 sm:py-5"
          >
            <p className="text-lg font-medium tracking-tight sm:text-xl lg:text-2xl">
              {stat.value}
            </p>
            <p className="mt-2 text-xs leading-snug text-black/60 dark:text-white/60 sm:text-sm">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}