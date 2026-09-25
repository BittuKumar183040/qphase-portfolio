"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import {
  ReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  getBezierPath,
  useReactFlow,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CORE_ITEMS } from "../config/coreItems";
import InputField from "../components/InputField";

// Design-time reference canvas — item x/y % resolve against this, then xyflow's fitView scales
// the whole thing (core, cards, lines) to fit the real container at any size.
const CANVAS_WIDTH = 1072;
const CANVAS_HEIGHT = 588;
const CORE_CENTER = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
const FIT_VIEW_OPTIONS = { padding: 0.3, duration: 0 };

// Tells xyflow to treat every node's `position` as its CENTER point (for both rendering and
// fitView's bounding-box math), instead of its default top-left corner. This replaces manually
// hacking `translate(-50%, -50%)` inside each node's own content — that approach fights xyflow's
// own layout/measurement rather than actually centering against it.
const NODE_ORIGIN: [number, number] = [0.5, 0.5];

// How much further along the scroll (as a 0–1 fraction of the section's reveal distance) a line
// waits before it starts drawing, relative to its own card's reveal window. 0 = line and card
// move in perfect lockstep. Positive = line lags behind (draws after the card has already begun
// appearing). Negative = line leads (starts drawing before the card appears, arriving as the
// card fades in). Tune this one number to control the whole diagram's line timing.
const LINE_ENTRY_DELAY = 0.4;

const TABLET_QUERY = "(max-width: 1023px)";
const MOBILE_QUERY = "(max-width: 639px)";

/** 0 = desktop, 1 = tablet, 2 = mobile. */
function useBreakpointIndex(): number {
  const [bp, setBp] = useState(0);
  useEffect(() => {
    const mqTablet = window.matchMedia(TABLET_QUERY);
    const mqMobile = window.matchMedia(MOBILE_QUERY);
    const update = () => setBp(mqMobile.matches ? 2 : mqTablet.matches ? 1 : 0);
    update();
    mqTablet.addEventListener("change", update);
    mqMobile.addEventListener("change", update);
    return () => {
      mqTablet.removeEventListener("change", update);
      mqMobile.removeEventListener("change", update);
    };
  }, []);
  return bp;
}

type Side = "left" | "right";
export type Responsive<T> = [T, T, T];

export interface CoreItem {
  id: string;
  /** Which side of the core this card sits on — also picks which handle the line attaches to. */
  side?: Side;
  title: string;
  label?: string;
  className?: string;
  /** Position as a % of the design canvas, per breakpoint: [desktop, tablet, mobile]. */
  x: Responsive<number>;
  y: Responsive<number>;
  /** Card width in px. A single number applies at every breakpoint. */
  width?: number | Responsive<number>;
  motionX?: number;
  motionY?: number;
  motionRotate?: number;
  motionScale?: number;
}

export interface ResolvedItem extends CoreItem {
  anchor: { x: number; y: number };
  widthPx: number;
  motionX: number;
  motionY: number;
  motionRotate: number;
  motionScale: number;
}

/** Scroll-progress window (both 0–1 fractions of the section's own reveal distance) that an
 * item's card animates through, keyed by index. `delay` shifts the window later (positive) or
 * earlier (negative) without changing its length — used to offset a line from its card. Cards
 * call this with no delay; CoreSectionInner passes LINE_ENTRY_DELAY when building each edge. */
export function revealRange(index: number, delay = 0): { start: number; end: number } {
  const start = Math.min(0.1 * index, 0.4) + delay;
  const end = Math.min(start + 0.55, 1);
  return { start, end };
}

function widthAt(width: CoreItem["width"], bp: number, fallback = 200): number {
  return width == null ? fallback : Array.isArray(width) ? width[bp] : width;
}

function resolveItem(item: CoreItem, bp: number): ResolvedItem {
  const sideSign = item.side === "left" ? -1 : 1;
  return {
    ...item,
    // With NODE_ORIGIN = [0.5, 0.5], this anchor point is the CENTER of the rendered card —
    // xyflow itself positions the node so its middle lands here, no CSS transform needed.
    anchor: { x: (item.x[bp] / 100) * CANVAS_WIDTH, y: (item.y[bp] / 100) * CANVAS_HEIGHT },
    widthPx: widthAt(item.width, bp),
    motionX: item.motionX ?? sideSign * 60,
    motionY: item.motionY ?? 0,
    motionRotate: item.motionRotate ?? sideSign * 3,
    motionScale: item.motionScale ?? 0.85,
  };
}

// Handles are functional connection points only — never shown.
const HIDDEN_HANDLE: React.CSSProperties = {
  opacity: 0,
  width: 1,
  height: 1,
  border: "none",
  background: "transparent",
  pointerEvents: "none",
};

// Same as HIDDEN_HANDLE, but re-anchored to sit at the node's exact center instead of xyflow's
// default edge-of-node placement (left:0 / right:0) — so every line leaving the core starts from
// one shared point, regardless of which side it's headed to. Independent of NODE_ORIGIN: this
// positions the handle *within* the node's own box, not the node itself against the canvas.
const CENTER_HANDLE: React.CSSProperties = {
  ...HIDDEN_HANDLE,
  left: "50%",
  top: "50%",
  right: "auto",
  bottom: "auto",
  transform: "translate(-50%, -50%)",
};

type CardData = { item: ResolvedItem; index: number; revealProgress: MotionValue<number> };
type CoreData = { coreImageSrc?: string };
type EdgeData = { revealProgress: MotionValue<number>; start: number; end: number };

/** InputField wrapped as an xyflow node. The Handle sits on whichever edge faces the core, so the
 * line always attaches to the card's real rendered boundary — never a guessed anchor point.
 * No positioning transform here: NODE_ORIGIN handles centering the node itself against xyflow's
 * `position`, so this just needs to render its natural content. */
function CardNode({ data }: NodeProps) {
  const { item, index, revealProgress } = data as unknown as CardData;
  return (
    <div>
      <Handle
        type="target"
        position={item.side === "left" ? Position.Right : Position.Left}
        id="in"
        style={HIDDEN_HANDLE}
        isConnectable={false}
      />
      <InputField item={item} index={index} scrollYProgress={revealProgress} />
    </div>
  );
}

/** The pulsing core. Exposes left/right source handles, both anchored to the node's exact
 * center, so every line leaving the core starts from one shared point. Like CardNode, no
 * positioning transform here — NODE_ORIGIN centers the whole node against CORE_CENTER. */
function CoreNode({ data }: NodeProps) {
  const { coreImageSrc } = data as unknown as CoreData;
  return (
    <div className="relative">
      <Handle type="source" position={Position.Left} id="core-left" style={CENTER_HANDLE} isConnectable={false} />
      <Handle type="source" position={Position.Right} id="core-right" style={CENTER_HANDLE} isConnectable={false} />

      <span className="absolute inset-0 animate-ping rounded-full border-2 border-white/20 dark:border-black/20 [animation-duration:2.6s]" />
      <span className="absolute inset-0 animate-ping rounded-full border-2 border-white/20 dark:border-black/20 [animation-delay:0.6s] [animation-duration:2.6s]" />

      <div className="relative size-50 overflow-hidden rounded-full bg-black [animation-duration:2.4s] md:size-32">
        <img
          src={coreImageSrc}
          alt=""
          className="absolute inset-0 m-auto h-[60%] w-[60%] object-contain object-center"
        />
      </div>
    </div>
  );
}

/** The curved connector. sourceX/Y and targetX/Y come from xyflow itself — measured from the real
 * Handle elements on the core and the card — so the path always meets both ends exactly. Color
 * flips with the site's dark mode via Tailwind's `dark:` variant, no JS theme detection needed. */
function CurvedEdge({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, data }: EdgeProps) {
  const { revealProgress, start, end } = data as unknown as EdgeData;
  const [d] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, curvature: 0.4 });
  // getBezierPath always starts the "d" at sourceX/Y (the core) and ends at targetX/Y (the card),
  // so animating pathLength 0 -> 1 draws the line growing from the core out to the card.
  const pathLength = useTransform(revealProgress, [start, end], [0, 1]);
  return (
    <motion.path
      d={d}
      fill="none"
      strokeWidth={2.5}
      className="stroke-white dark:stroke-black"
      style={{ pathLength }}
    />
  );
}

const NODE_TYPES = { core: CoreNode, card: CardNode };
const EDGE_TYPES = { curved: CurvedEdge };

interface CoreSectionProps {
  coreImageSrc?: string;
  items?: CoreItem[];
}

export default function CoreSection(props: CoreSectionProps) {
  return (
    <ReactFlowProvider>
      <CoreSectionInner {...props} />
    </ReactFlowProvider>
  );
}

function CoreSectionInner({ coreImageSrc, items = CORE_ITEMS }: CoreSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bp = useBreakpointIndex();
  const { fitView } = useReactFlow();

  // Fades the whole diagram in as the section scrolls into view — no ScrollTrigger/GSAP needed.
  const { scrollYProgress: revealProgress } = useScroll({
    target: sectionRef,
    offset: ["start 90%", "start 10%"],
  });

  const resolvedItems = useMemo(() => items.map((item) => resolveItem(item, bp)), [items, bp]);

  const nodes = useMemo<Node[]>(
    () => [
      {
        id: "core",
        type: "core",
        position: CORE_CENTER,
        data: { coreImageSrc },
        draggable: false,
        selectable: false,
      },
      ...resolvedItems.map(
        (item, index): Node => ({
          id: item.id,
          type: "card",
          position: item.anchor,
          data: { item, index, revealProgress },
          draggable: false,
          selectable: false,
        }),
      ),
    ],
    [resolvedItems, coreImageSrc, revealProgress],
  );

  const edges = useMemo<Edge[]>(
    () =>
      resolvedItems.map(
        (item, index): Edge => ({
          id: `edge-${item.id}`,
          source: "core",
          sourceHandle: item.side === "left" ? "core-left" : "core-right",
          target: item.id,
          targetHandle: "in",
          type: "curved",
          data: { revealProgress, ...revealRange(index, LINE_ENTRY_DELAY) },
          selectable: false,
        }),
      ),
    [resolvedItems, revealProgress],
  );

  // Keeps the diagram framed to its container at any size — continuous, not just the three
  // breakpoints above (those only change the layout's shape).
  useEffect(() => {
    fitView(FIT_VIEW_OPTIONS);
  }, [bp, fitView]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => fitView(FIT_VIEW_OPTIONS));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitView]);

  return (
    // Below `md`: fixed width, height derived from the design canvas' own aspect ratio (so the
    // diagram's proportions stay identical across phones/tablets instead of being squashed by
    // whatever height the device happens to have), capped at the dynamic viewport height so it
    // never forces the page taller than the visible screen. At `md` and up: revert to the
    // previous parent-controlled h-full/w-full sizing.
    <section
      ref={sectionRef}
      className="relative aspect-1072/588 max-h-dvh w-full md:aspect-auto md:h-full md:max-h-none"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        nodeOrigin={NODE_ORIGIN}
        fitView
        fitViewOptions={FIT_VIEW_OPTIONS}
        minZoom={0.05}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
      />
    </section>
  );
}