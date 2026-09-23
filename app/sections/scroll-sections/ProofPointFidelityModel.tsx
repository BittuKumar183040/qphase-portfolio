import { fidelityModel } from "../../config/content";
import { motion } from "framer-motion";
import { container, item, viewport } from "./Reveal";

export default function ProofPointFidelityModel() {
  return (
    <section id="fidelity-model" className="h-dvh"
    >
      <motion.div
        className="relative w-full h-full lg:w-8/12 xl:w-9/12 flex flex-col justify-center p-5 sm:p-10 md:p-20"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <motion.h2 variants={item} className="text-3xl font-medium tracking-tight text-[#3A362E] sm:text-4xl">
          {fidelityModel.headline}
        </motion.h2>

        <div className="mt-8 space-y-4">
          {fidelityModel.bodyParagraphs.map((p) => (
            <motion.p key={p} variants={item} className="leading-relaxed text-[#4A463C]">
              {p}
            </motion.p>
          ))}
        </div>

        <motion.div
          variants={item}
          className="mt-10 flex items-stretch divide-x divide-[#E4DFD3] border border-[#E4DFD3]"
        >
          {fidelityModel.comparison.map((row) => (
            <div key={row.label} className="flex-1 px-5 py-5">
              <p className="text-xl text-[#8C4A2A]">{row.value}</p>
              <p className="mt-1.5  leading-snug text-[#8B8577]">{row.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}