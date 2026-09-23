import { dataSection } from "../../config/content";
import { motion } from "framer-motion";
import { container, item, viewport } from "./Reveal";

export default function DataMeasuredNotModeled() {
  return (
    <section id="data" className="h-dvh"
    >
      <motion.div
        className="relative w-full h-full lg:w-8/12 xl:w-9/12 flex flex-col justify-center p-5 sm:p-10 md:p-20"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <motion.h2 variants={item} className="text-3xl font-medium tracking-tight text-[#3A362E] sm:text-4xl">
          {dataSection.headline}
        </motion.h2>

        <div className="mt-8 space-y-4">
          {dataSection.bodyParagraphs.map((p) => (
            <motion.p key={p} variants={item} className="leading-relaxed text-[#4A463C]">
              {p}
            </motion.p>
          ))}
        </div>

        <motion.dl variants={item} className="mt-10 divide-y divide-[#E4DFD3] border-y border-[#E4DFD3]">
          {dataSection.logRows.map((row) => (
            <div key={row.key} className="flex items-baseline justify-between gap-6 py-3">
              <dt className="tracking-wide text-[#8B8577]">{row.key}</dt>
              <dd className="text-right text-[#3A362E]">{row.value}</dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  );
}