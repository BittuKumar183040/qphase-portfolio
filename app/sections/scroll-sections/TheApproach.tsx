// TheApproach.tsx

import { motion } from "framer-motion";
import {item} from "./core/Reveal";
import { ScrollSectionData } from "@/app/config/content";

export default function TheApproach() {
  return (
    <>
      <motion.p
        variants={item}
        className="absolute top-20 tracking-wide text-[#8C4A2A]"
      >
        {ScrollSectionData.approach.kicker}
      </motion.p>
      <motion.h2
        variants={item}
        className="mt-3 text-3xl font-medium tracking-tight text-[#3A362E] sm:text-4xl"
      >
        {ScrollSectionData.approach.headline}
      </motion.h2>
      <motion.p variants={item} className="mt-5 leading-relaxed text-[#4A463C]">
        {ScrollSectionData.approach.body}
      </motion.p>
      <motion.p
        variants={item}
        className="mt-6 border-l-2 border-[#8C4A2A] pl-4 italic leading-relaxed text-[#4A463C]"
      >
        {ScrollSectionData.approach.pullquote}
      </motion.p>
      <motion.div
        variants={item}
        className=" absolute bottom-0 space-y-1 tracking-wide text-[#B9B2A0]"
      >
        {ScrollSectionData.approach.footnote.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </motion.div>
    </>
  );
}
