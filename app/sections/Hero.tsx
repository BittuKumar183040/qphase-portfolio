"use client";

import { motion, useReducedMotion } from "framer-motion";
import { container, heroSectionItem } from "./scroll-sections/core/Reveal";
import { hero } from "../config/content";
import TypingText from "../components/TypingText";

type SymbolTone = "brand" | "cool";
interface QuantumSymbol {
  char: string;
  top: string;
  left: string;
  size: string;
  delay: number;
  duration: number;
  tone: SymbolTone;
}

const QUANTUM_SYMBOLS: QuantumSymbol[] = [
  { char: "|0⟩", top: "14%", left: "7%", size: "text-xl", delay: 0, duration: 7, tone: "brand" },
  { char: "|1⟩", top: "76%", left: "11%", size: "text-md", delay: 0.6, duration: 8.5, tone: "cool" },
  { char: "⟨ψ|", top: "20%", left: "89%", size: "text-xl", delay: 1.1, duration: 6.5, tone: "brand" },
  { char: "Σ", top: "64%", left: "92%", size: "text-xl", delay: 0.3, duration: 9, tone: "cool" },
  { char: "∫", top: "8%", left: "44%", size: "text-md", delay: 1.8, duration: 7.8, tone: "brand" },
  { char: "H", top: "89%", left: "54%", size: "text-xs", delay: 0.9, duration: 6, tone: "brand" },
  { char: "⊗", top: "42%", left: "4%", size: "text-xl", delay: 1.4, duration: 8, tone: "cool" },
  { char: "√", top: "50%", left: "96%", size: "text-lg", delay: 0.2, duration: 7.2, tone: "brand" },
  { char: "π", top: "13%", left: "70%", size: "text-xl", delay: 1.6, duration: 6.8, tone: "cool" },
  { char: "ħ", top: "83%", left: "80%", size: "text-xs", delay: 0.5, duration: 9.4, tone: "brand" },
  { char: "CNOT", top: "34%", left: "18%", size: "text-sm", delay: 1.0, duration: 8.2, tone: "cool" },
  { char: "Ω", top: "60%", left: "34%", size: "text-lg", delay: 0.7, duration: 7.5, tone: "brand" },
];

const Hero = () => {

  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="relative flex h-7/12 w-full flex-col items-center justify-center p-5
        bg-linear-to-b from-white/0 via-white/70 to-white
        dark:from-black/0 dark:via-black/70 dark:to-black
      "
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        variants={heroSectionItem}
        className="flex flex-col items-center gap-2 text-center font-quantico-bold text-4xl font-bold text-[#8C4A2A] sm:text-4xl"
      >
        <span>{hero.title}</span>
        <TypingText texts={hero.endTexts} staticTexts={hero.static} />
      </motion.h1>

      <motion.p
        variants={heroSectionItem}
        className="mt-8 max-w-lg text-center text-[#8B8577]"
      >
        {hero.pipelineNote}
      </motion.p>

      <motion.div
        variants={heroSectionItem}
        className="mt-10 flex items-center gap-6"
      >
        <button className="rounded-sm bg-[#8C4A2A] px-5 py-2.5 text-[#F6F3EE] transition-colors hover:bg-[#733D22]">
          {hero.primaryCta}
        </button>

        <button className="border-l border-[#3A362E] pl-4 text-[#3A362E] transition-colors hover:text-[#8C4A2A]">
          {hero.secondaryCta}
        </button>
      </motion.div>

      {/* scattered, low-opacity quantum/math notation, drifting slowly */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {QUANTUM_SYMBOLS.map((s, i) => (
          <motion.span
            key={i}
            className={`absolute select-none font-mono ${s.size} ${TONE_CLASSES[s.tone]}`}
            style={{ top: s.top, left: s.left }}
            animate={
              prefersReducedMotion
                ? undefined
                : { y: [0, -3, 0] }
            }
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {s.char}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

const TONE_CLASSES: Record<SymbolTone, string> = {
  brand: "text-[#8C4A2A] opacity-[0.07] dark:text-[#D9A57A] dark:opacity-[0.12]",
  cool: "text-[#6B7280] opacity-[0.06] dark:text-[#8FB6C9] dark:opacity-[0.11]",
};

export default Hero;