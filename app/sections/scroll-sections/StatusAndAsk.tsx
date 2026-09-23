import { statusAndAsk } from "../../config/content";
import { motion } from "framer-motion";
import { container, item, viewport } from "./Reveal";

export default function StatusAndAsk() {
  return (
    <section id="status" className="h-dvh"
    >
      <motion.div
        className="relative w-full h-full lg:w-8/12 xl:w-9/12 flex flex-col justify-center p-5 sm:p-10 md:p-20"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <motion.h2 variants={item} className="text-3xl font-medium tracking-tight text-[#3A362E] sm:text-4xl">
          {statusAndAsk.headline}
        </motion.h2>

        <div className="mt-8 space-y-4">
          {statusAndAsk.bodyParagraphs.map((p) => (
            <motion.p key={p} variants={item} className="leading-relaxed text-[#4A463C]">
              {p}
            </motion.p>
          ))}
        </div>

        <motion.div variants={item} className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statusAndAsk.status.map((s) => (
            <div key={s.label} className="border border-[#E4DFD3] px-4 py-4">
              <p className=" text-[#8B8577]">{s.label}</p>
              <p className="mt-1 font-medium text-[#3A362E]">{s.value}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}