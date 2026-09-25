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
// the whole thing (core, cards, lines) to fit the real container at any size. One canvas per
// breakpoint: mobile's is taller-than-wide (rather than reusing desktop's wide ratio) so the same
// x/y percentages naturally spread further apart vertically on a phone. Keep each entry's ratio
// in sync with the matching `sm:`/`lg:` aspect-ratio class on the section below, or fitView will
// letterbox instead of filling the container.
const CANVAS_SIZES: [
  { width: number; height: number },
  { width: number; height: number },
  { width: number; height: number },
] = [
  { width: 1072, height: 588 }, // desktop
  { width: 980, height: 680 }, // tablet
  { width: 720, height: 1180 }, // mobile — taller than wide
];
const FIT_VIEW_OPTIONS = { padding: 0.25, duration: 0 };

// Tells xyflow to treat every node's `position` as its CENTER point (for both rendering and
// fitView's bounding-box math), instead of its default top-left corner.
const NODE_ORIGIN: [number, number] = [0.5, 0.5];

// How much further along the scroll (as a 0–1 fraction of the section's reveal distance) a line
// waits before it starts drawing, relative to its own card's reveal window. 0 = line and card
// move in perfect lockstep. Positive = line lags behind. Negative = line leads.
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
  /** Which side the card starts on for its entrance slide — no longer used to pick which line
   * handle it connects through (that's now geometric, see `nearestSide`). */
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
 * earlier (negative) without changing its length — used to offset a line from its card. */
export function revealRange(index: number, delay = 0): { start: number; end: number } {
  const start = Math.min(0.1 * index, 0.4) + delay;
  const end = Math.min(start + 0.55, 1);
  return { start, end };
}

function widthAt(width: CoreItem["width"], bp: number, fallback = 200): number {
  return width == null ? fallback : Array.isArray(width) ? width[bp] : width;
}

function resolveItem(item: CoreItem, bp: number): ResolvedItem {
  const { width: canvasWidth, height: canvasHeight } = CANVAS_SIZES[bp];
  const sideSign = item.side === "left" ? -1 : 1;
  return {
    ...item,
    anchor: { x: (item.x[bp] / 100) * canvasWidth, y: (item.y[bp] / 100) * canvasHeight },
    widthPx: widthAt(item.width, bp),
    motionX: item.motionX ?? sideSign * 60,
    motionY: item.motionY ?? 0,
    motionRotate: item.motionRotate ?? sideSign * 3,
    motionScale: item.motionScale ?? 0.85,
  };
}

type CardinalSide = "top" | "bottom" | "left" | "right";
const CARDINAL_SIDES: CardinalSide[] = ["top", "bottom", "left", "right"];
const HANDLE_POSITION: Record<CardinalSide, Position> = {
  top: Position.Top,
  bottom: Position.Bottom,
  left: Position.Left,
  right: Position.Right,
};

/** Picks whichever of the 4 cardinal sides points most directly from `from` toward `to`. Used to
 * choose, per breakpoint, which of a node's 4 handles an edge should actually connect through —
 * so a card that ends up above/below the core (as on mobile's taller canvas) attaches via its
 * top/bottom handle instead of always being forced through left/right. */
function nearestSide(from: { x: number; y: number }, to: { x: number; y: number }): CardinalSide {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "right" : "left";
  return dy >= 0 ? "bottom" : "top";
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
// default edge-of-node placement — so every line leaving the core starts from one shared point
// regardless of which of its 4 handles ends up used.
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

/** InputField wrapped as an xyflow node. Exposes a hidden target handle on all 4 sides — so
 * whichever side actually faces the core (computed per breakpoint in CoreSectionInner) has a
 * real, correctly-positioned connection point for the line to attach to. No positioning
 * transform here: NODE_ORIGIN handles centering the node itself against xyflow's `position`. */
function CardNode({ data }: NodeProps) {
  const { item, index, revealProgress } = data as unknown as CardData;
  return (
    <div>
      {CARDINAL_SIDES.map((side) => (
        <Handle
          key={side}
          type="target"
          position={HANDLE_POSITION[side]}
          id={`target-${side}`}
          style={HIDDEN_HANDLE}
          isConnectable={false}
        />
      ))}
      <InputField item={item} index={index} scrollYProgress={revealProgress} />
    </div>
  );
}

/** The pulsing core. Exposes a hidden source handle on all 4 sides, all anchored to the node's
 * exact center, so every line leaving the core starts from one shared point — CoreSectionInner
 * picks whichever side's id best matches the direction toward each card. */
function CoreNode({ data }: NodeProps) {
  const { coreImageSrc } = data as unknown as CoreData;
  return (
    <div className="relative">
      {CARDINAL_SIDES.map((side) => (
        <Handle
          key={side}
          type="source"
          position={HANDLE_POSITION[side]}
          id={`core-${side}`}
          style={CENTER_HANDLE}
          isConnectable={false}
        />
      ))}

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
 * Handle elements on the core and the card — so the path always meets both ends exactly. */
function CurvedEdge({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, data }: EdgeProps) {
  const { revealProgress, start, end } = data as unknown as EdgeData;
  const [d] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, curvature: 0.4 });
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

  const { scrollYProgress: revealProgress } = useScroll({
    target: sectionRef,
    offset: ["start 90%", "start 15%"],
  });

  // The core's own position on the current breakpoint's canvas — recomputed whenever the canvas
  // size changes (i.e. whenever bp changes), since each breakpoint now has its own dimensions.
  const coreCenter = useMemo(() => {
    const { width, height } = CANVAS_SIZES[bp];
    return { x: width / 2, y: height / 2 };
  }, [bp]);

  const resolvedItems = useMemo(() => items.map((item) => resolveItem(item, bp)), [items, bp]);

  const nodes = useMemo<Node[]>(
    () => [
      {
        id: "core",
        type: "core",
        position: coreCenter,
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
    [resolvedItems, coreImageSrc, revealProgress, coreCenter],
  );

  const edges = useMemo<Edge[]>(
    () =>
      resolvedItems.map((item, index): Edge => {
        // Recomputed every time `resolvedItems`/`coreCenter` changes (i.e. every breakpoint
        // change), so the connection point re-picks itself whenever the layout reflows.
        const sourceSide = nearestSide(coreCenter, item.anchor); // side of the CORE facing this card
        const targetSide = nearestSide(item.anchor, coreCenter); // side of the CARD facing the core
        return {
          id: `edge-${item.id}`,
          source: "core",
          sourceHandle: `core-${sourceSide}`,
          target: item.id,
          targetHandle: `target-${targetSide}`,
          type: "curved",
          data: { revealProgress, ...revealRange(index, LINE_ENTRY_DELAY) },
          selectable: false,
        };
      }),
    [resolvedItems, revealProgress, coreCenter],
  );

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
    // Mobile (base, <640): the container's own aspect ratio matches CANVAS_SIZES[2] (taller than
    // wide) exactly, so fitView fills it edge to edge instead of letterboxing — this is what
    // actually spreads the cards down the screen, not just giving the section more height.
    // Capped at the dynamic viewport height so it can never force the page taller than the
    // visible screen. Tablet (sm, 640–1023): matches CANVAS_SIZES[1]. Desktop (lg, 1024+):
    // reverts to the original parent-controlled h-full/w-full sizing.
    <section
      ref={sectionRef}
      className="relative aspect-[720/1180] max-h-dvh w-full sm:aspect-[980/680] lg:aspect-auto lg:h-full lg:max-h-none"
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