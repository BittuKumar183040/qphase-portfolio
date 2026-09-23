// TheApproach.tsx

import { motion } from "framer-motion";
import { container, item, viewport } from "./Reveal";
import { approach } from "@/app/config/content";

export default function TheApproach() {
  return (
    <section
      id="approach"
      className="h-dvh"
    >
      <motion.div
        className="relative w-full h-full lg:w-8/12 xl:w-9/12 flex flex-col justify-center p-5 sm:p-10 md:p-20"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <motion.p variants={item} className="absolute top-20 tracking-wide text-[#8C4A2A]">
          {approach.kicker}
        </motion.p>
        <motion.h2 variants={item} className="mt-3 text-3xl font-medium tracking-tight text-[#3A362E] sm:text-4xl">
          {approach.headline}
        </motion.h2>
        <motion.p variants={item} className="mt-5 leading-relaxed text-[#4A463C]">
          {approach.body}
        </motion.p>
        <motion.p
          variants={item}
          className="mt-6 border-l-2 border-[#8C4A2A] pl-4 italic leading-relaxed text-[#4A463C]"
        >
          {approach.pullquote}
        </motion.p>
        <motion.div variants={item} className=" absolute bottom-0 space-y-1 tracking-wide text-[#B9B2A0]">
          {approach.footnote.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}