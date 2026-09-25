"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";

interface TypingTextProps {
  /** the words/phrases that get the typing-flip animation */
  texts: string[];
  /**
   * optional plain prefix shown before each animated text, paired by index
   * (e.g. static[0] goes with texts[0]). Rendered instantly, no animation.
   */
  staticTexts?: string[];
  /** how long to hold the fully-typed text before flipping to the next, in ms */
  breathingTime?: number;
  /** duration of a single character's flip-out or flip-in, in seconds */
  flipDuration?: number;
  /** delay between each character's flip start, in seconds — the "typing" cadence */
  stagger?: number;
  className?: string;
  staticClassName?: string;
}

const NBSP = "\u00A0";

export default function TypingText({
  texts,
  staticTexts,
  breathingTime = 3500,
  flipDuration = 0.45,
  stagger = 0.045,
  className = "",
  staticClassName = "",
}: TypingTextProps) {
  const [index, setIndex] = useState(0);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const current = texts[index] ?? "";
  const currentStatic = staticTexts?.[index] ?? "";

  // Flip the visible characters in, in sequence, whenever the text changes —
  // this staggered, start-to-end reveal is what gives it the "typing" feel.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const chars = el.querySelectorAll<HTMLElement>(".flip-char span");
    if (prefersReducedMotion) {
      gsap.set(chars, { rotateX: 0, y: 0, opacity: 1, filter: "blur(0px)" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        {
          rotateX: -100,
          y: 16,
          opacity: 0,
          filter: "blur(5px)",
          transformOrigin: "50% 70%",
        },
        {
          rotateX: 0,
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: flipDuration,
          ease: "expo.out",
          stagger: { each: stagger, from: "start" },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [index, current, flipDuration, stagger, prefersReducedMotion]);

  // Once fully typed in, wait `breathingTime` ms, then flip the characters
  // out (also staggered) before advancing to the next text.
  useEffect(() => {
    if (texts.length <= 1) return;

    const el = wrapRef.current;
    const flipInMs = (flipDuration + Math.max(current.length - 1, 0) * stagger) * 1000;

    const timer = setTimeout(() => {
      const advance = () => setIndex((i) => (i + 1) % texts.length);

      if (!el || prefersReducedMotion) {
        advance();
        return;
      }

      const chars = el.querySelectorAll<HTMLElement>(".flip-char span");
      gsap.to(chars, {
        rotateX: 100,
        y: -14,
        opacity: 0,
        filter: "blur(5px)",
        duration: flipDuration * 0.7,
        ease: "power2.in",
        stagger: { each: stagger * 0.6, from: "start" },
        onComplete: advance,
      });
    }, flipInMs + breathingTime);

    return () => clearTimeout(timer);
  }, [index, current, texts, breathingTime, flipDuration, stagger, prefersReducedMotion]);

  return (
    <motion.span
      layout
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`flip-text-root inline-flex flex-wrap items-baseline justify-center gap-x-2 ${className}`}
    >
      <style>{`
        .flip-text-root .flip-char {
          display: inline-block;
          perspective: 700px;
        }
        .flip-text-root .flip-char span {
          display: inline-block;
          will-change: transform, opacity, filter;
        }
      `}</style>

      {staticTexts && (
        <span className={staticClassName}>{currentStatic}</span>
      )}

      <span ref={wrapRef} aria-live="polite" aria-atomic="true">
        {current.split("").map((ch, i) => (
          <span className="flip-char" key={i}>
            <span>{ch === " " ? NBSP : ch}</span>
          </span>
        ))}
      </span>
    </motion.span>
  );
}