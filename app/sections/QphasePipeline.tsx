"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { motion } from "framer-motion";

import "@xyflow/react/dist/style.css";
import { item } from "./scroll-sections/core/Reveal";
import PipelineGraph from "./pipeline/PipelineGraph";

export default function QphasePipeline() {
  return (
    <section className="relative flex w-full min-h-dvh flex-col pointer-events-none justify-center bg-white py-24 text-black dark:bg-black dark:text-white">
      {/* Content — natural height */}
      <motion.div
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="flex-none"
      >
        <motion.div variants={item} className="mb-5 flex items-center gap-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/50 dark:text-white/50">
            The Architecture
          </span>

          <span className="h-px w-10 bg-black/20 dark:bg-white/20" />
        </motion.div>

        <motion.h2
          variants={item}
          className="max-w-4xl text-4xl font-medium leading-[1.04] tracking-tight text-black dark:text-white sm:text-5xl lg:text-6xl"
        >
          The Pipeline,
          <br />
        </motion.h2>

        <motion.p
          variants={item}
          className="mt-6 max-w-2xl text-base leading-relaxed text-black/60 dark:text-white/60 sm:text-lg"
        >
          QPhase takes one quantum algorithm, translates it into a hardware-independent representation, compiles it for the target architecture, and verifies the result before execution.
        </motion.p>
      </motion.div>

      {/* Graph — consumes remaining space */}
      <motion.div
        variants={item}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="mt-12 flex min-h-0 flex-1"
      >
        <ReactFlowProvider>
          <PipelineGraph />
        </ReactFlowProvider>
      </motion.div>

      {/* Bottom explanation — natural height */}
      <motion.div
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-8 grid flex-none gap-6 border-t border-black/10 pt-6 dark:border-white/10 sm:grid-cols-3"
      >
        <motion.div variants={item}>
          <p className="text-sm font-medium text-black/80 dark:text-white/80">Write once</p>

          <p className="mt-1.5 text-xs leading-relaxed text-black/50 dark:text-white/50">
            One algorithm becomes a portable QPhase representation.
          </p>
        </motion.div>

        <motion.div variants={item}>
          <p className="text-sm font-medium text-black/80 dark:text-white/80">Compile anywhere</p>

          <p className="mt-1.5 text-xs leading-relaxed text-black/50 dark:text-white/50">
            The same representation is mapped to different hardware.
          </p>
        </motion.div>

        <motion.div variants={item}>
          <p className="text-sm font-medium text-black/80 dark:text-white/80">Verify before execution</p>

          <p className="mt-1.5 text-xs leading-relaxed text-black/50 dark:text-white/50">
            Every compilation is checked against the original circuit.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}