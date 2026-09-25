"use client"

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useScrollController } from "./scroll-controller";
import { navItems } from "@/app/config/content";

const DOT_SIZE = 8;

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
  // Sections no longer live in normal document flow, so "which one is
  // active" comes from the shared controller, and the rail should only
  // appear once ScrollSections is actually the thing filling the screen —
  // not the moment the page mounts.
  const { activeId, pinned, goTo } = useScrollController();
  const railVisible = pinned;

  const { containerRef, dotRefs, span } = useDotSpan(navItems.length, [railVisible]);

  const handleClick = (id: string) => {
    goTo(id);
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
          className="fixed right-4 top-1/2 z-40 -translate-y-1/2 sm:right-6 lg:right-8 xl:right-16"
        >
          <nav
            ref={containerRef as React.RefObject<HTMLElement>}
            aria-label="Section navigation"
            className="relative flex min-w-0 flex-col gap-5 py-3 lg:min-w-37 lg:gap-7"
          >
            {/* static track — spans exactly from the first dot's center to the last dot's center */}
            <div
              className="pointer-events-none absolute z-0 w-px bg-[#E4DFD3]"
              style={{ left: DOT_SIZE / 2, top: span.top, height: span.height }}
            />

            {navItems.map((navItem, i) => {
              const isActive = navItem.id === activeId;
              return (
                <button
                  key={navItem.id}
                  onClick={() => handleClick(navItem.id)}
                  aria-label={navItem.label}
                  className="group relative z-10 flex items-center gap-0 text-left lg:gap-4"
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

                  <span className="relative hidden h-fit overflow-hidden lg:block">
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