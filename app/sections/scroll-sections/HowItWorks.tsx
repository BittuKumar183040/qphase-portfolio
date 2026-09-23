// HowItWorks.tsx

import { motion } from "framer-motion";
import { container, item, viewport } from "./Reveal";
import PipelineDiagram from "./PipelineDiagram";
import { howItWorks } from "@/app/config/content";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="h-dvh"
    >
      <motion.div
        className="relative w-full h-full lg:w-8/12 xl:w-9/12 flex flex-col justify-center p-5 sm:p-10 md:p-20"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <motion.h2 variants={item} className="text-3xl font-medium tracking-tight text-[#3A362E] sm:text-4xl">
          {howItWorks.headline}
        </motion.h2>

        <motion.div variants={item} className="mt-10 overflow-x-auto">
          <PipelineDiagram highlight={howItWorks.highlightStep} layout="inline" />
        </motion.div>

        <motion.p variants={item} className="mt-8 max-w-lg text-[15px] leading-relaxed text-[#4A463C]">
          {howItWorks.body}
        </motion.p>
      </motion.div>
    </section>
  );
}