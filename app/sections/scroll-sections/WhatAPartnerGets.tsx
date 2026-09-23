import { partner } from "../../config/content";
import { motion } from "framer-motion";
import { container, item, viewport } from "./Reveal";

export default function WhatAPartnerGets() {
  return (
    <section id="partner" className="h-dvh"
    >
      <motion.div
        className="relative w-full h-full lg:w-8/12 xl:w-9/12 flex flex-col justify-center p-5 sm:p-10 md:p-20"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <motion.h2 variants={item} className="text-3xl font-medium tracking-tight text-[#3A362E] sm:text-4xl">
          {partner.headline}
        </motion.h2>
        <motion.p variants={item} className="mt-5 leading-relaxed text-[#4A463C]">
          {partner.body}
        </motion.p>

        <motion.div variants={item} className="mt-10 divide-y divide-[#E4DFD3] border-y border-[#E4DFD3]">
          {partner.items.map((thing) => (
            <div key={thing.title} className="py-5">
              <p className="font-medium text-[#3A362E]">{thing.title}</p>
              <p className="mt-1.5 leading-relaxed text-[#8B8577]">{thing.body}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}