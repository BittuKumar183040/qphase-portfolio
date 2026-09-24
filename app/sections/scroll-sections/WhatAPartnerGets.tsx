import { ScrollSectionData } from "../../config/content";
import { motion } from "framer-motion";
import { item } from "./core/Reveal";

export default function WhatAPartnerGets() {
  return (
    <>
      <motion.h2
        variants={item}
        className="text-3xl font-medium tracking-tight text-[#3A362E] sm:text-4xl"
      >
        {ScrollSectionData.partner.headline}
      </motion.h2>
      <motion.p variants={item} className="mt-5 leading-relaxed text-[#4A463C]">
        {ScrollSectionData.partner.body}
      </motion.p>

      <motion.div
        variants={item}
        className="mt-10 divide-y divide-[#E4DFD3] border-y border-[#E4DFD3]"
      >
        {ScrollSectionData.partner.items.map((thing) => (
          <div key={thing.title} className="py-5">
            <p className="font-medium text-[#3A362E]">{thing.title}</p>
            <p className="mt-1.5 leading-relaxed text-[#8B8577]">
              {thing.body}
            </p>
          </div>
        ))}
      </motion.div>
    </>
  );
}
