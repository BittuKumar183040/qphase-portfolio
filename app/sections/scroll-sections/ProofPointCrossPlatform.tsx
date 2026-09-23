import { crossPlatform } from "../../config/content";
import { motion } from "framer-motion";
import { container, item, viewport } from "./Reveal";

export default function ProofPointCrossPlatform() {
  return (
    <section id="cross-platform" className="h-dvh"
    >
      <motion.div
        className="relative w-full h-full lg:w-8/12 xl:w-9/12 flex flex-col justify-center p-5 sm:p-10 md:p-20"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <motion.h2 variants={item} className="text-3xl font-medium tracking-tight text-[#3A362E] sm:text-4xl">
          {crossPlatform.headline}
        </motion.h2>
        <motion.p variants={item} className="mt-5 leading-relaxed text-[#4A463C]">
          {crossPlatform.body}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-[#E4DFD3] sm:grid-cols-2"
        >
          {crossPlatform.backends.map((b) => (
            <div key={b.name} className="bg-[#F6F3EE] px-5 py-4">
              <p className="font-medium text-[#3A362E]">{b.name}</p>
              <p className="mt-1  text-[#8B8577]">{b.detail}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}