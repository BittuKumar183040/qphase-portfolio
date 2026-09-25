"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface ScrollControllerValue {
  ids: string[];
  index: number;
  activeId: string;
  isAnimating: boolean;
  /** True once ScrollSections has captured scroll input (pinned to the viewport). */
  pinned: boolean;
  /** Attach to the element that should be pinned/tracked. */
  rootRef: (el: HTMLDivElement | null) => void;
  goTo: (target: number | string) => void;
  next: () => void;
  prev: () => void;
}

const ScrollControllerContext = createContext<ScrollControllerValue | null>(null);

// Must be >= the exit + enter animation time in ScrollSections' dissolve
// transition, so a fast scroll/swipe can't queue up a second jump mid-fade.
const TRANSITION_LOCK_MS = 200;
const WHEEL_THRESHOLD = 40; // accumulated deltaY before one wheel "tick" fires a step
const TOUCH_THRESHOLD = 60; // px of vertical swipe before a step fires
const ENGAGE_RATIO = 0.8; // how much of the block must be visible before it grabs scroll
const ALIGN_DURATION_MS = 550; // rough duration of the native smooth-scroll used to snap into place

// window.__lenisInstance is declared globally in SmoothScrollProvider.tsx,
// which owns the actual Lenis instance. We only ever call stop()/start() on
// it here — reading it lazily at interaction time (not caching it on mount)
// avoids a race with which component's effect happens to run first.
function getLenis() {
  return typeof window !== "undefined" ? window.__lenisInstance : undefined;
}

export function ScrollControllerProvider({
  ids,
  children,
}: {
  ids: string[];
  children: ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pinned, setPinned] = useState(false);

  // Refs for anything read inside event listeners/observers, so they always
  // see the latest value without needing to be re-bound on every change.
  const sectionElRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const lockRef = useRef(false);
  const pinnedRef = useRef(false);
  const releasingRef = useRef(false);
  const wheelAccumRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);

  const rootRef = useCallback((el: HTMLDivElement | null) => {
    sectionElRef.current = el;
  }, []);

  const setPinnedState = useCallback((value: boolean) => {
    if (pinnedRef.current === value) return;
    pinnedRef.current = value;
    setPinned(value);
  }, []);

  const goTo = useCallback(
    (target: number | string) => {
      const targetIndex = typeof target === "number" ? target : ids.indexOf(target);
      if (targetIndex < 0 || targetIndex >= ids.length) return;
      if (lockRef.current || targetIndex === indexRef.current) return;

      lockRef.current = true;
      indexRef.current = targetIndex;
      setIndex(targetIndex);
      setIsAnimating(true);

      window.setTimeout(() => {
        lockRef.current = false;
        setIsAnimating(false);
      }, TRANSITION_LOCK_MS);
    },
    [ids]
  );

  const next = useCallback(() => goTo(indexRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(indexRef.current - 1), [goTo]);

  // Called once the section becomes meaningfully visible (from either
  // direction). Freezes Lenis, then snaps the rest of the way into exact
  // alignment with a native smooth-scroll — the "magnetic" pull-in.
  //
  // Order matters here: lenis.stop() pauses Lenis's own rAF-driven scroll
  // updates, so a *native* window.scrollTo (not lenis.scrollTo) is used for
  // the correction — that way it isn't racing Lenis's own tween loop, which
  // would otherwise be paused mid-animation by the same stop() call.
  const engage = useCallback(() => {
    if (pinnedRef.current) return;
    setPinnedState(true);
    lockRef.current = true;

    getLenis()?.stop();

    const el = sectionElRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const target = window.scrollY + rect.top;
      window.scrollTo({ top: target, behavior: "smooth" });
    }

    window.setTimeout(() => {
      lockRef.current = false;
    }, ALIGN_DURATION_MS);
  }, [setPinnedState]);

  // Hands scroll back to Lenis at a boundary (first section going up, last
  // section going down) and gives the escape a decisive push — a full
  // viewport hop, via Lenis now that it's running again — rather than
  // relying on the single wheel tick that triggered the release to also be
  // the thing that carries the user clear.
  //
  // releasingRef matters because that escape scroll is itself animated: the
  // section's visibility ratio drops gradually, not instantly, and
  // IntersectionObserver fires on every threshold it crosses on the way
  // down (0.75, 0.5, 0.3 — all still >= ENGAGE_RATIO). Without this cooldown
  // suppressing engage() during that window, the observer would see "not
  // pinned, still highly visible" mid-escape and immediately re-pin —
  // which is exactly what made it impossible to leave.
  const release = useCallback(
    (direction: "up" | "down") => {
      setPinnedState(false);
      releasingRef.current = true;

      const lenis = getLenis();
      const nudge = window.innerHeight;
      const target = window.scrollY + (direction === "up" ? -nudge : nudge);

      if (lenis) {
        lenis.start();
        lenis.scrollTo(target, { duration: 0.8 });
      } else {
        window.scrollTo({ top: target, behavior: "smooth" });
      }

      window.setTimeout(() => {
        releasingRef.current = false;
      }, 950);
    },
    [setPinnedState]
  );

  // IntersectionObserver, not scroll-position polling: it reports visibility
  // as of each check, so a large/fast scroll jump can't skip past a narrow
  // detection window the way frame-by-frame rect polling could.
  useEffect(() => {
    const el = sectionElRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const ratio = entries[0]?.intersectionRatio ?? 0;
        if (ratio >= ENGAGE_RATIO && !pinnedRef.current && !releasingRef.current) {
          engage();
        }
      },
      { threshold: [0, 0.1, ENGAGE_RATIO, 0.3, 0.5, 0.75, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [engage]);

  // Input capture: only acts while pinned. Lenis ignores preventDefault (it
  // reads wheel/touch deltas directly and drives scroll itself), so the
  // actual gate is lenis.stop()/start() via engage()/release() above — the
  // preventDefault calls here are just a defensive no-op backstop for any
  // native scrolling that might otherwise slip through.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!pinnedRef.current) return;

      if (lockRef.current) {
        e.preventDefault();
        return;
      }

      wheelAccumRef.current += e.deltaY;
      if (Math.abs(wheelAccumRef.current) < WHEEL_THRESHOLD) {
        e.preventDefault();
        return;
      }

      const goingDown = wheelAccumRef.current > 0;
      wheelAccumRef.current = 0;

      if (goingDown && indexRef.current === ids.length - 1) {
        release("down"); // last section, scrolling down
        return;
      }
      if (!goingDown && indexRef.current === 0) {
        release("up"); // first section, scrolling up
        return;
      }

      e.preventDefault();
      goingDown ? next() : prev();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!pinnedRef.current || lockRef.current) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (indexRef.current === ids.length - 1) {
          release("down");
          return;
        }
        e.preventDefault();
        next();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (indexRef.current === 0) {
          release("up");
          return;
        }
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(ids.length - 1);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (pinnedRef.current && !lockRef.current) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!pinnedRef.current || lockRef.current || touchStartYRef.current === null) return;
      const endY = e.changedTouches[0]?.clientY ?? touchStartYRef.current;
      const delta = touchStartYRef.current - endY;
      touchStartYRef.current = null;
      if (Math.abs(delta) < TOUCH_THRESHOLD) return;

      const goingDown = delta > 0;
      if (goingDown && indexRef.current === ids.length - 1) {
        release("down");
        return;
      }
      if (!goingDown && indexRef.current === 0) {
        release("up");
        return;
      }

      goingDown ? next() : prev();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [ids.length, next, prev, goTo, release]);

  return (
    <ScrollControllerContext.Provider
      value={{ ids, index, activeId: ids[index], isAnimating, pinned, rootRef, goTo, next, prev }}
    >
      {children}
    </ScrollControllerContext.Provider>
  );
}

export function useScrollController() {
  const ctx = useContext(ScrollControllerContext);
  if (!ctx) {
    throw new Error("useScrollController must be used within a ScrollControllerProvider");
  }
  return ctx;
}