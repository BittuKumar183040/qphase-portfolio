"use client";

import { useEffect, useState } from "react";
import { motion, useInView, animate, Variants } from "framer-motion";
import { useRef } from "react";
import { verification } from "../config/proofVerification";

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

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

const wordReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const statBox: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.94,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function AnimatedWords({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={wordReveal}
          className="inline-block"
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </>
  );
}

const NUMBER_PATTERN = /[\d,]*\.?\d+/g;

function formatLike(token: string, value: number) {
  const decimalMatch = token.match(/\.(\d+)/);
  const decimals = decimalMatch ? decimalMatch[1].length : 0;
  const hasComma = token.includes(",");
  let out = value.toFixed(decimals);
  if (hasComma) {
    const [intPart, decPart] = out.split(".");
    out = Number(intPart).toLocaleString("en-US") + (decPart ? "." + decPart : "");
  }
  return out;
}

function zeroedVersion(value: string) {
  return value.replace(NUMBER_PATTERN, (m) => formatLike(m, 0));
}

function CountUpValue({ value, isInView }: { value: string; isInView: boolean }) {
  const [display, setDisplay] = useState(() => zeroedVersion(value));

  useEffect(() => {
    if (!isInView) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(zeroedVersion(value));
      return;
    }

    const tokens = value.match(NUMBER_PATTERN);
    if (!tokens) {
      setDisplay(value);
      return;
    }
    const targets = tokens.map((t) => parseFloat(t.replace(/,/g, "")));

    const controls = animate(0, 1, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (progress) => {
        let i = 0;
        const next = value.replace(NUMBER_PATTERN, (token) => {
          const formatted = formatLike(token, targets[i] * progress);
          i++;
          return formatted;
        });
        setDisplay(next);
      },
    });

    return () => controls.stop();
  }, [isInView, value]);

  return <>{display}</>;
}

function StatBox({ stat }: { stat: { value: string; label: string } }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      variants={statBox}
      className="rounded-sm border border-black/10 bg-black/3 px-4 py-4 text-black dark:border-white/10 dark:bg-white/5 dark:text-white sm:px-5 sm:py-5"
    >
      <p className="text-lg font-medium tracking-tight sm:text-xl lg:text-2xl">
        <CountUpValue value={stat.value} isInView={isInView} />
      </p>
      <p className="mt-2 text-xs leading-snug text-black/60 dark:text-white/60 sm:text-sm">
        {stat.label}
      </p>
    </motion.div>
  );
}

export default function ProofPointVerification() {
  const { eyebrow, heading, body, stats } = verification;

  return (
    <section>
      {/* Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        exit="hidden"
        viewport={{ once: false, amount: 0.2 }}
        variants={stagger}
      >
        <motion.div variants={reveal} className="mb-5 flex items-center gap-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/50 dark:text-white/50">
            {eyebrow}
          </span>

          <span className="h-px w-10 bg-black/20 dark:bg-white/20" />
        </motion.div>

        <motion.h2
          variants={stagger}
          className="max-w-3xl text-4xl font-medium leading-[1.04] tracking-tight text-black dark:text-white sm:text-5xl lg:text-6xl"
        >
          <AnimatedWords text={heading.line1} />{" "}
          <motion.span variants={wordReveal} className="inline-block text-[#733d22]">
            {heading.line2}
          </motion.span>
        </motion.h2>

        <motion.p
          variants={reveal}
          className="mt-6 max-w-2xl text-base leading-relaxed text-black/60 dark:text-white/60 sm:text-lg"
        >
          {body}
        </motion.p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        exit="hidden"
        viewport={{ once: false, amount: 0.1 }}
        variants={stagger}
        className="mt-14 grid grid-cols-2 gap-2.5 sm:gap-3"
      >
        {stats.map((stat) => (
          <StatBox key={stat.label} stat={stat} />
        ))}
      </motion.div>
    </section>
  );
}