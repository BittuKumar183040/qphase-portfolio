"use client";

import { motion } from "framer-motion";

import { container, item } from "../util/Reveal";
import { ChevronRight, MoveRight } from "lucide-react";

export const CONTACT_URL = "https://rexcrux.com/qphase";

export default function ContactUs() {
  return (
    <section
      id="contact"
      className="relative w-full bg-white py-24 text-black dark:bg-black dark:text-white sm:px-5 md:px-10 lg:px-20"
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
          <span className="text-[#733d22]">QPhase?</span>
        </motion.h2>

        <motion.a
          variants={item}
          href={CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 mt-10 rounded-full bg-black pl-4 text-sm font-medium transition-colors duration-300 hover:bg-black/80 dark:bg-white dark:hover:bg-white/80"
        >
          <span className=" text-white dark:text-black">Contact Us</span>

          <MoveRight size={35} className=" m-2 p-2 rounded-full bg-white text-black dark:text-white dark:bg-black "/>
        </motion.a>
      </motion.div>
    </section>
  );
}
