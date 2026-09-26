"use client";

import { motion, Variants } from "framer-motion";
import { ProblemSolutionData } from "../config/problemSolution";

const reveal: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

function HighlightedText({ text, styled, className = "" }: { text: string; styled?: string; className?: string }) {
  if (!styled) { return <>{text}</> }
  const index = text.indexOf(styled);
  if (index === -1) { return <>{text}</> }

  return (
    <>
      {text.slice(0, index)}
      <span className={className}>{styled}</span>
      {text.slice(index + styled.length)}
    </>
  );
}

export default function ProblemSolution() {
  const { problem, solution } = ProblemSolutionData;

  return (
    <section className="relative w-full overflow-hidden bg-white">
      <div className="grid lg:grid-cols-2">
        {/* PROBLEM */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="relative flex h-full w-full flex-col bg-black text-white p-5 sm:p-10 md:p-20"
        >
          <div className="w-full max-w-2xl">
            {/* Eyebrow */}
            <motion.div
              variants={reveal}
              className="mb-6 flex items-center gap-3"
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">
                {problem.eyebrow}
              </span>

              <span className="h-px w-10 bg-white/20" />
            </motion.div>

            {/* Title */}
            <motion.h2
              variants={reveal}
              className="max-w-3xl text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[52px]"
            >
              <HighlightedText
                text={problem.title.text}
                styled={problem.title.styled}
                className="text-[#733d22]"
              />
            </motion.h2>

            {/* Body */}
            <motion.p
              variants={reveal}
              className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg"
            >
              <HighlightedText
                text={problem.body.text}
                styled={problem.body.styled}
                className="text-white"
              />
            </motion.p>

            {/* Hardware */}
            <motion.div
              variants={reveal}
              className="mt-12 divide-y divide-white/10 border-y border-white/20"
            >
              {problem.items.map((item) => (
                <motion.div
                  key={item.number}
                  variants={reveal}
                  className="group flex gap-5 py-6"
                >
                  {/* Number */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs font-medium text-white/50 transition-colors duration-300 group-hover:border-white/60 group-hover:text-white">
                    {item.number}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-medium tracking-tight text-white/90">
                      {item.title}
                    </h3>

                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/60">
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Footer */}
            <motion.p
              variants={reveal}
              className="mt-7 max-w-xl text-sm italic leading-relaxed text-white/50"
            >
              {problem.footer}
            </motion.p>
          </div>
        </motion.div>

        {/* SOLUTION */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="relative flex h-full w-full flex-col border-t border-black/10 bg-white dark:bg-black/20 p-5 text-black sm:p-10 md:p-20 lg:border-l lg:border-t-0"
        >
          <div className="w-full max-w-2xl">
            {/* Eyebrow */}
            <motion.div
              variants={reveal}
              className="mb-6 flex items-center gap-3"
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/50">
                {solution.eyebrow}
              </span>

              <span className="h-px w-10 bg-black/20" />
            </motion.div>

            {/* Title */}
            <motion.h2
              variants={reveal}
              className="max-w-3xl text-4xl font-medium leading-[1.05] tracking-tight text-black sm:text-5xl lg:text-[52px]"
            >
              <HighlightedText
                text={solution.title.text}
                styled={solution.title.styled}
                className="text-[#733d22]"
              />
            </motion.h2>

            {/* Body */}
            <motion.p
              variants={reveal}
              className="mt-6 max-w-2xl text-base leading-relaxed text-black/70 sm:text-lg"
            >
              <HighlightedText
                text={solution.body.text}
                styled={solution.body.styled}
                className="text-black"
              />
            </motion.p>

            {/* Solution steps */}
            <motion.div variants={reveal} className="relative mt-12">
              {/* Connecting line */}
              <div className="absolute bottom-12 left-3.75 top-8 w-px bg-black/15" />

              <div className="space-y-8">
                {solution.items.map((item) => (
                  <motion.div
                    key={item.number}
                    variants={reveal}
                    className="group relative flex gap-5"
                  >
                    {/* Number */}
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/20 bg-white dark:bg-black dark:text-white/80 text-xs font-medium text-black/60 transition-all duration-300 group-hover:border-black/60 group-hover:text-black group-hover:dark:text-white ">
                      {item.number}
                    </div>

                    {/* Content */}
                    <div className="pt-0.5">
                      <h3 className="font-medium tracking-tight text-black/90">
                        {item.title}
                      </h3>

                      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-black/60">
                        {item.body}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Process */}
            <motion.div
              variants={reveal}
              className="mt-12 border-t border-black/15 pt-6"
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {solution.footer.items.map((item, index) => (
                  <div key={item} className="flex items-center gap-4">
                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/45">
                      {item}
                    </span>

                    {index < solution.footer.items.length - 1 && (
                      <span className="text-xs text-black/25">→</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.08)] lg:block" />
    </section>
  );
}
