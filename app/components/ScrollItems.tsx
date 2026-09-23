"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { navItems } from "../config/content";

const DOT_SIZE = 8; // px — matches the `size-2` dot below

/**
 * Scrollspy driven by a trigger line at `triggerRatio` down the viewport
 * (default 30%), not by IntersectionObserver visibility. With full-height
 * (min-h-dvh) sections, "is it intersecting" stays true for almost the
 * whole scroll, so the old approach only switched once the previous
 * section had nearly left the screen. This instead walks the sections in
 * order and keeps the last one whose top has crossed above the trigger
 * line — so the indicator advances as soon as the next section reaches
 * 30% into the screen, regardless of how much of the previous one is
 * still visible below it.
 */
function useActiveSection(ids: string[], triggerRatio = 0.3) {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const triggerY = window.innerHeight * triggerRatio;

      let current = sections[0].id;
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= triggerY) {
          current = el.id;
        }
      }
      setActiveId((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ids, triggerRatio]);

  return activeId;
}

/**
 * The rail only belongs to the scroll-sections story — it fades in once
 * The Approach has reached the same 30% trigger line, and fades back out
 * if the user scrolls back above it.
 */
function useRailVisible(firstId: string, triggerRatio = 0.3) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById(firstId);
    if (!el) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const triggerY = window.innerHeight * triggerRatio;
      setVisible(el.getBoundingClientRect().top <= triggerY);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [firstId, triggerRatio]);

  return visible;
}

/**
 * Measures the exact vertical span between the center of the first dot and
 * the center of the last dot (relative to the nav container), so the rail
 * can be drawn precisely from circle to circle — never past the first one
 * or beyond the last one, and always threaded through their centers.
 */
function useDotSpan(dotCount: number, deps: unknown[]) {
  const containerRef = useRef<HTMLElement | null>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [span, setSpan] = useState({ top: 0, height: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const first = dotRefs.current[0];
      const last = dotRefs.current[dotCount - 1];
      if (!container || !first || !last) return;

      const containerRect = container.getBoundingClientRect();
      const firstRect = first.getBoundingClientRect();
      const lastRect = last.getBoundingClientRect();

      const firstCenter = firstRect.top + firstRect.height / 2 - containerRect.top;
      const lastCenter = lastRect.top + lastRect.height / 2 - containerRect.top;

      setSpan({ top: firstCenter, height: lastCenter - firstCenter });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { containerRef, dotRefs, span };
}

export default function ScrollItems() {
  const ids = navItems.map((n) => n.id);
  const activeId = useActiveSection(ids);
  const railVisible = useRailVisible(ids[0]);
  const { scrollYProgress } = useScroll();

  const { containerRef, dotRefs, span } = useDotSpan(navItems.length, [railVisible]);

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <AnimatePresence>
      {railVisible && (
        <motion.div
          key="scroll-rail"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-8 top-1/2 z-40 hidden -translate-y-1/2 lg:block xl:right-16"
        >
          <nav
            ref={containerRef as React.RefObject<HTMLElement>}
            aria-label="Section navigation"
            className="relative flex min-w-37 flex-col gap-7 py-3"
          >
            {/* track — spans exactly from the first dot's center to the last dot's center */}
            <div
              className="pointer-events-none absolute z-0 w-px bg-[#E4DFD3]"
              style={{ left: DOT_SIZE / 2, top: span.top, height: span.height }}
            >
              <motion.div
                style={{ scaleY: scrollYProgress }}
                className="absolute inset-0 w-px origin-top bg-[#8C4A2A]"
              />
            </div>

            {navItems.map((navItem, i) => {
              const isActive = navItem.id === activeId;
              return (
                <button
                  key={navItem.id}
                  onClick={() => handleClick(navItem.id)}
                  className="group relative z-10 flex items-center gap-4 text-left"
                >
                  <span
                    ref={(el) => {
                      dotRefs.current[i] = el;
                    }}
                    className="relative grid size-2 shrink-0 place-items-center bg-[#F6F3EE]"
                  >
                    <span className="absolute inset-0 rounded-full border border-[#C9C2B2] bg-[#F6F3EE] transition-colors group-hover:border-[#8C4A2A]" />
                    {isActive && (
                      <motion.span
                        layoutId="active-dot"
                        className="absolute -inset-0.75 rounded-full bg-[#8C4A2A]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                  </span>

                  <span className="relative block h-fit overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      {isActive ? (
                        <motion.span
                          key={`${navItem.id}-active`}
                          initial={{ opacity: 0, y: 7 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -7 }}
                          transition={{ duration: 0.32, ease: "easeOut" }}
                          className="block whitespace-nowrap text-md tracking-wide text-[#8C4A2A]"
                        >
                          {navItem.label}
                        </motion.span>
                      ) : (
                        <motion.span
                          key={`${navItem.id}-idle`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.55 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="block whitespace-nowrap text-md tracking-wide text-[#8B8577] transition-colors group-hover:text-[#3A362E]"
                        >
                          {navItem.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </button>
              );
            })}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}