"use client"

import { motion } from "framer-motion";
import PipelineDiagram from "./PipelineDiagram";
import { container, item } from "./scroll-sections/Reveal";
import { hero } from "../config/content";

export default function Hero() {
  return (
    <>
        <motion.div
          className="relative w-full flex flex-col justify-center p-5 sm:p-10 md:p-20 pb-0"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={item}
            className="text-4xl font-semibold tracking-tight text-[#8C4A2A] sm:text-5xl"
          >
            {hero.title}
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-lg leading-relaxed text-[#4A463C]">
            {hero.tagline}
          </motion.p>

          <motion.div variants={item} className="mt-10">
            <PipelineDiagram layout="branch" />
          </motion.div>

          <motion.p variants={item} className="mt-8 max-w-md text-[#8B8577]">
            {hero.pipelineNote}
          </motion.p>

          <motion.div variants={item} className="mt-10 flex items-center gap-6">
            <button className="rounded-sm bg-[#8C4A2A] px-5 py-2.5 text-[#F6F3EE] transition-colors hover:bg-[#733D22]">
              {hero.primaryCta}
            </button>
            <button className="border-l border-[#3A362E] pl-4 text-[#3A362E] transition-colors hover:text-[#8C4A2A]">
              {hero.secondaryCta}
            </button>
          </motion.div>

          <motion.p
            variants={item}
            initial="hidden"
            animate="visible"
            className=" absolute bottom-10 tracking-wide text-[#B9B2A0] "
          >
            {hero.footer.split("").join("\u200a")}
          </motion.p>
        </motion.div>

    </>
  );
}