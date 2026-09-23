// ProofPointVerification.tsx

import { motion } from "framer-motion";
import { container, item, viewport } from "./Reveal";
import { verification } from "@/app/config/content";

export default function ProofPointVerification() {
  return (
    <section id="verification" className="h-dvh"
    >
      <motion.div
        className="relative w-full h-full lg:w-8/12 xl:w-9/12 flex flex-col justify-center p-5 sm:p-10 md:p-20"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <motion.h2 variants={item} className="text-3xl font-medium tracking-tight text-[#3A362E] sm:text-4xl">
          {verification.headline}
        </motion.h2>
        <motion.p variants={item} className="mt-5 leading-relaxed text-[#4A463C]">
          {verification.body}
        </motion.p>

        <motion.div variants={item} className="mt-10 grid grid-cols-2 gap-3">
          {verification.stats.map((stat) => (
            <div key={stat.label} className="rounded-sm bg-[#8C4A2A] px-5 py-5 text-[#F6F3EE]">
              <p className="text-2xl">{stat.value}</p>
              <p className="mt-2 leading-snug opacity-85">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}