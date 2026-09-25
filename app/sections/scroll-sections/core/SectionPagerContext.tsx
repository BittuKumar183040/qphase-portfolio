"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface SectionPagerContextValue {
  activeIndex: number;
  sectionCount: number;
  direction: 1 | -1;
  goTo: (index: number) => void;
  isAnimating: boolean;
}

const SectionPagerContext = createContext<SectionPagerContextValue | null>(null);

// Keep these two in sync with the transition durations used in ScrollSections —
// the cooldown must be at least as long as exit+enter, or a fast flick/scroll
// can fire a second page change mid-animation.
const COOLDOWN_MS = 1000;
const WHEEL_THRESHOLD = 40; // ignore trackpad micro-jitter
const TOUCH_THRESHOLD = 50;

export function SectionPagerProvider({
  sectionCount,
  children,
}: {
  sectionCount: number;
  children: ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const activeIndexRef = useRef(activeIndex);
  // eslint-disable-next-line react-hooks/refs
  activeIndexRef.current = activeIndex;
  const cooldownRef = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(sectionCount - 1, index));
      if (clamped === activeIndexRef.current || cooldownRef.current) return;

      cooldownRef.current = true;
      setDirection(clamped > activeIndexRef.current ? 1 : -1);
      setIsAnimating(true);
      setActiveIndex(clamped);

      window.setTimeout(() => {
        cooldownRef.current = false;
        setIsAnimating(false);
      }, COOLDOWN_MS);
    },
    [sectionCount]
  );

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (cooldownRef.current || Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
      goTo(activeIndexRef.current + (e.deltaY > 0 ? 1 : -1));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goTo(activeIndexRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goTo(activeIndexRef.current - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(sectionCount - 1);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // native touch-scroll would otherwise fight the pager
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const delta = touchStartY.current - (e.changedTouches[0]?.clientY ?? touchStartY.current);
      touchStartY.current = null;
      if (Math.abs(delta) < TOUCH_THRESHOLD) return;
      goTo(activeIndexRef.current + (delta > 0 ? 1 : -1));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    // The pager owns scroll now — the page itself must not also scroll.
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [goTo, sectionCount]);

  return (
    <SectionPagerContext.Provider
      value={{ activeIndex, sectionCount, direction, goTo, isAnimating }}
    >
      {children}
    </SectionPagerContext.Provider>
  );
}

export function useSectionPager() {
  const ctx = useContext(SectionPagerContext);
  if (!ctx) {
    throw new Error("useSectionPager must be used within a SectionPagerProvider");
  }
  return ctx;
}