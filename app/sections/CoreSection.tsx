/* eslint-disable react-hooks/refs */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { motion, animate, useMotionValue } from "framer-motion";
import InputField from "../components/ui/InputField";
import { CORE_ITEMS } from "../config/coreItems";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

const SCROLL_START = "top 60%";
const LINE_REVEAL_DELAY_MS = 500;

const INPUT_REVEAL_DURATION_S = 0.8;
const POSITION_TRANSITION_S = 0.6;

const CORE_CENTER = { x: 536, y: 294 };

const DARK_LINE_START = "rgba(0,0,0,1)";
const DARK_LINE_END = "rgba(0,0,0,1)";

// Tailwind-ish breakpoints: 0 = desktop (lg+), 1 = tablet (sm-lg), 2 = mobile (<sm)
const TABLET_QUERY = "(max-width: 1023px)";
const MOBILE_QUERY = "(max-width: 639px)";

function isDarkMode(): boolean {
  if (typeof document === "undefined") return false;
  if (document.documentElement.classList.contains("dark")) return true;
  if (document.documentElement.classList.contains("light")) return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

/** 0 = desktop, 1 = tablet, 2 = mobile. Reads live on the client, defaults to desktop for SSR. */
function useBreakpointIndex(): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const mqTablet = window.matchMedia(TABLET_QUERY);
    const mqMobile = window.matchMedia(MOBILE_QUERY);

    const update = () => {
      if (mqMobile.matches) setIndex(2);
      else if (mqTablet.matches) setIndex(1);
      else setIndex(0);
    };

    update();
    mqTablet.addEventListener("change", update);
    mqMobile.addEventListener("change", update);
    return () => {
      mqTablet.removeEventListener("change", update);
      mqMobile.removeEventListener("change", update);
    };
  }, []);

  return index;
}

type Side = "left" | "right";
type Point = { x: number; y: number };

/** A value that differs per breakpoint: [desktop, tablet, mobile]. */
export type Responsive<T> = [T, T, T];

export interface CoreItem {
  id: string;
  /** Only used to default the hover-drift direction (motionX/motionRotate) — no longer drives layout. */
  side?: Side;
  title: string;
  label?: string;
  className?: string;

  /** Position of the box as a % of the container, per breakpoint: [desktop, tablet, mobile]. */
  x: Responsive<number>;
  /** Position of the box as a % of the container, per breakpoint: [desktop, tablet, mobile]. */
  y: Responsive<number>;
  /**
   * Optional SVG path override (in the 0 0 1072 588 viewBox), per breakpoint. Leave a slot
   * `undefined`/omit the array entirely to auto-trace a curve from the box's live x/y to the
   * core — this is what keeps the line attached to the box as it moves. Only set this when you
   * want a custom curve shape instead of the auto-trace.
   */
  width?: number | string;
  path?: Partial<Responsive<string>>;

  linePosition?: number;
  lineDuration?: number;
  lineEase?: string;
  motionX?: number;
  motionY?: number;
  motionRotate?: number;
  motionScale?: number;
}

export interface ResolvedItem extends CoreItem {
  d: string;
  anchor: Point;
  xPct: number;
  yPct: number;
  linePosition: number;
  lineDuration: number;
  lineEase: string;
  motionX: number;
  motionY: number;
  motionRotate: number;
  motionScale: number;
}

/** Converts the box's % position into the SVG's 0 0 1072 588 viewBox space. */
function anchorFromPct(xPct: number, yPct: number): Point {
  return { x: (xPct / 100) * 1072, y: (yPct / 100) * 588 };
}

/** Traces a smooth curve from the box's anchor to the core center. */
function autoTracePath(anchor: Point, core: Point = CORE_CENTER): string {
  const dx = core.x - anchor.x;
  const c1 = { x: anchor.x + dx * 0.55, y: anchor.y };
  const c2 = { x: anchor.x + dx * 0.8, y: core.y + (anchor.y - core.y) * 0.15 };
  // Same curve shape as before, wound in the opposite direction: starts at the core,
  // ends at the box, so the draw-on animation and spark travel core -> input field.
  return `M ${core.x} ${core.y} C ${c2.x} ${c2.y}, ${c1.x} ${c1.y}, ${anchor.x} ${anchor.y}`;
}

function resolveItem(item: CoreItem, bp: number): ResolvedItem {
  const sideSign = item.side === "left" ? -1 : 1;
  const xPct = item.x[bp];
  const yPct = item.y[bp];
  const anchor = anchorFromPct(xPct, yPct);
  const override = item.path?.[bp];
  return {
    ...item,
    d: override ?? autoTracePath(anchor),
    anchor,
    xPct,
    yPct,
    linePosition: item.linePosition ?? 0.15,
    lineDuration: item.lineDuration ?? 1,
    lineEase: item.lineEase ?? "power2.out",
    motionX: item.motionX ?? sideSign * 60,
    motionY: item.motionY ?? 0,
    motionRotate: item.motionRotate ?? sideSign * 3,
    motionScale: item.motionScale ?? 0.85,
  };
}

interface CoreSectionProps {
  coreImageSrc?: string;
  coreLabel?: string;
  items?: CoreItem[];
}

export default function CoreSection({
  coreImageSrc,
  items = CORE_ITEMS,
}: CoreSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);

  const bp = useBreakpointIndex();

  const resolvedItems = useMemo(
    () => items.map((item) => resolveItem(item, bp)),
    [items, bp],
  );

  const revealProgress = useMotionValue(0);
  const resolvedItemsRef = useRef(resolvedItems);
  resolvedItemsRef.current = resolvedItems;

  // Rebuilds the line-drawing setup whenever the resolved paths change (i.e. on breakpoint
  // change), the same way it already rebuilt on dark-mode toggle — the path geometry (length,
  // dash offsets) is only valid for the paths that were current when it was captured.
  useLayoutEffect(() => {
    if (!sectionRef.current || !svgRef.current) return;

    let lineRevealTimeoutId: number | undefined;
    let leaveDebounceId: number | undefined;
    let linesTl: gsap.core.Timeline | null = null;

    const setup = () => {
      const dark = isDarkMode();

      const ctx = gsap.context(() => {
        const lines = resolvedItemsRef.current
          .map((item) => {
            const path = svgRef.current!.querySelector<SVGPathElement>(
              `[data-line-id="${item.id}"]`,
            );
            const spark = svgRef.current!.querySelector<SVGCircleElement>(
              `[data-spark-id="${item.id}"]`,
            );
            if (!path) return null;

            const length = path.getTotalLength();
            const strokeValue = dark
              ? `url(#line-gradient-${item.id})`
              : DARK_LINE_START;

            gsap.set(path, {
              strokeDasharray: length,
              strokeDashoffset: length,
              stroke: strokeValue,
            });
            if (spark) gsap.set(spark, { opacity: 0 });

            return { item, path, spark, length };
          })
          .filter(
            (
              l,
            ): l is {
              item: ResolvedItem;
              path: SVGPathElement;
              spark: SVGCircleElement | null;
              length: number;
            } => l !== null,
          );

        const drawLines = () => {
          linesTl?.kill();
          const tl = gsap.timeline();
          linesTl = tl;

          lines.forEach(({ item, path, spark }) => {
            tl.to(
              path,
              dark
                ? {
                    strokeDashoffset: 0,
                    duration: item.lineDuration,
                    ease: item.lineEase,
                  }
                : {
                    strokeDashoffset: 0,
                    stroke: DARK_LINE_END,
                    duration: item.lineDuration,
                    ease: item.lineEase,
                  },
              item.linePosition,
            );

            if (spark) {
              tl.to(spark, { opacity: 1, duration: 0.05 }, item.linePosition)
                .to(
                  spark,
                  {
                    motionPath: {
                      path,
                      align: path,
                      alignOrigin: [0.5, 0.5],
                    },
                    duration: item.lineDuration,
                    ease: item.lineEase,
                  },
                  item.linePosition,
                )
                .to(
                  spark,
                  { opacity: 0, duration: 0.08 },
                  item.linePosition + item.lineDuration - 0.08,
                );
            }
          });
        };

        const hideLines = () => {
          window.clearTimeout(lineRevealTimeoutId);
          linesTl?.kill();
          linesTl = null;

          lines.forEach(({ path, spark, length }) => {
            gsap.to(path, {
              strokeDashoffset: length,
              duration: 0.4,
              ease: "power1.in",
              overwrite: true,
            });
            if (spark) gsap.to(spark, { opacity: 0, duration: 0.2 });
          });
        };

        const revealSection = () => {
          window.clearTimeout(leaveDebounceId);
          window.clearTimeout(lineRevealTimeoutId);
          animate(revealProgress, 1, {
            duration: INPUT_REVEAL_DURATION_S,
            ease: "easeOut",
          }).then(() => {
            lineRevealTimeoutId = window.setTimeout(
              drawLines,
              LINE_REVEAL_DELAY_MS,
            );
          });
        };

        const hideSection = () => {
          animate(revealProgress, 0, {
            duration: INPUT_REVEAL_DURATION_S,
            ease: "easeOut",
          });
          hideLines();
        };

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: SCROLL_START,
          invalidateOnRefresh: true,
          onEnter: revealSection,
          onLeaveBack: () => {
            window.clearTimeout(leaveDebounceId);
            leaveDebounceId = window.setTimeout(hideSection, 150);
          },
        });

        // If we're rebuilding because the breakpoint just changed (not the initial mount)
        // and the section is already on screen, redraw immediately instead of waiting for
        // the next scroll crossing — keeps the breakpoint switch feeling smooth/live.
        const rect = sectionRef.current!.getBoundingClientRect();
        const alreadyInView =
          rect.top < window.innerHeight * 0.6 && rect.bottom > 0;
        if (alreadyInView) revealSection();
      }, sectionRef);

      return ctx;
    };

    let ctx = setup();
    let currentlyDark = isDarkMode();

    const handleLoadOrResize = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoadOrResize);
    window.addEventListener("resize", handleLoadOrResize);

    const themeObserver = new MutationObserver(() => {
      const nowDark = isDarkMode();
      if (nowDark === currentlyDark) return;
      currentlyDark = nowDark;

      window.clearTimeout(lineRevealTimeoutId);
      window.clearTimeout(leaveDebounceId);
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      ctx = setup();
      ScrollTrigger.refresh();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.clearTimeout(lineRevealTimeoutId);
      window.clearTimeout(leaveDebounceId);
      ctx.revert();
      themeObserver.disconnect();
      window.removeEventListener("load", handleLoadOrResize);
      window.removeEventListener("resize", handleLoadOrResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bp]);

  useLayoutEffect(() => {
    if (!coreRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(coreRef.current, {
        scale: 1,
        duration: 2.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      ringRefs.current.forEach((ring, i) => {
        if (!ring) return;
        gsap.fromTo(
          ring,
          { scale: 1, opacity: 0.05 },
          {
            scale: 4,
            opacity: 0,
            duration: 2.6,
            ease: "power1.out",
            repeat: -1,
            delay: i * 0.5,
          },
        );
      });
    }, coreRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen w-full items-center justify-center bg-transparent px-6 py-16"
    >
      <div className="relative aspect-1072/588 w-full max-w-275">
        <svg
          ref={svgRef}
          viewBox="0 0 1072 588"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            {resolvedItems.map((item) => (
              <linearGradient
                key={`grad-${item.id}`}
                id={`line-gradient-${item.id}`}
                gradientUnits="userSpaceOnUse"
                x1={CORE_CENTER.x}
                y1={CORE_CENTER.y}
                x2={item.anchor.x}
                y2={item.anchor.y}
              >
                <stop
                  offset="0%"
                  stopColor="var(--core-line-color, #151515)"
                  stopOpacity="0.6"
                />
                <stop offset="100%" stopColor="#151515" stopOpacity="0.8" />
              </linearGradient>
            ))}
          </defs>

          {resolvedItems.map((item) => (
            <React.Fragment key={item.id}>
              <path
                data-line-id={item.id}
                d={item.d}
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </React.Fragment>
          ))}
        </svg>

        {/* Freely-positioned items: each box sits at (xPct, yPct)% of the container and
            glides to its new spot with framer-motion whenever xPct/yPct change — whether
            that's a breakpoint switch or you editing the config live. */}
        {resolvedItems.map((item, i) => (
          <motion.div
            key={item.id}
            className={`absolute ${item.className ?? ""}`}
            style={{ transform: "translate(-50%, -50%)" }}
            animate={{ left: `${item.xPct}%`, top: `${item.yPct}%` }}
            transition={{
              duration: POSITION_TRANSITION_S,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <InputField
              item={item}
              index={i}
              scrollYProgress={revealProgress}
            />
          </motion.div>
        ))}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            ref={(el) => void (ringRefs.current[0] = el)}
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/20"
          />
          <div
            ref={(el) => void (ringRefs.current[1] = el)}
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/20"
          />

          <div
            ref={coreRef}
            className="relative flex size-50 items-center bg-black rounded-full justify-center overflow-visible"
          >
            <img src={coreImageSrc} alt="" className="size-50 object-contain" />

            <ul
              className="absolute left-1/2 top-full mt-6 flex w-fll -translate-x-1/2 flex-col justify-center h-full
               gap-2 overflow-auto text-lg text-black
               max-h-60"
            >
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
