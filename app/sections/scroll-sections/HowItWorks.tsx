import { motion } from "framer-motion";
import { item } from "./core/Reveal";
import PipelineDiagram from "./PipelineDiagram";
import { ScrollSectionData } from "@/app/config/content";

export default function HowItWorks() {
  return (
    <>
      <motion.h2
        variants={item}
        className="text-3xl font-medium tracking-tight text-[#3A362E] sm:text-4xl"
      >
        {ScrollSectionData.howItWorks.headline}
      </motion.h2>

      <motion.div variants={item} className="mt-10 overflow-x-auto">
        <PipelineDiagram highlight={ScrollSectionData.howItWorks.highlightStep} />
      </motion.div>

      <motion.p
        variants={item}
        className="mt-8 max-w-lg text-[15px] leading-relaxed text-[#4A463C]"
      >
        {ScrollSectionData.howItWorks.body}
      </motion.p>
    </>
  );
}
