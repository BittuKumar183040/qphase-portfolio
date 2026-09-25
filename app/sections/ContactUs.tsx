"use client";

import { motion } from "framer-motion";

import { container, item } from "./scroll-sections/core/Reveal";

export const CONTACT_URL = "https://rexcrux.com/qphase";

export default function ContactUs() {
  return (
    <section
      id="contact"
      className="relative w-full bg-white px-6 py-24 text-black dark:bg-black dark:text-white sm:px-5 md:px-10 lg:px-20"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={container}
        className="flex flex-col items-center text-center"
      >
        <motion.div variants={item} className="mb-5 flex items-center gap-3">
          <span className="h-px w-10 bg-black/20 dark:bg-white/20" />
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/50 dark:text-white/50">
            Get in touch
          </span>
          <span className="h-px w-10 bg-black/20 dark:bg-white/20" />
        </motion.div>

        <motion.h2
          variants={item}
          className="text-3xl font-medium leading-[1.04] tracking-tight text-black dark:text-white sm:text-4xl lg:text-5xl"
        >
          Ready to build with{" "}
          <span className="text-black/40 dark:text-white/40">QPhase?</span>
        </motion.h2>

        <motion.a
          variants={item}
          href={CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-black px-8 py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          Contact Us
          <svg
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17 17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </motion.a>
      </motion.div>
    </section>
  );
}
