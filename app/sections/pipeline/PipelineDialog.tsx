"use client";

import {
  Background,
  BaseEdge,
  getSmoothStepPath,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useDragControls,
  type PanInfo,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { PipelineNodeData } from "./PipelineNode";

/** Brand color, used in both light and dark mode (same as PipelineNode). */
const ACCENT = "#733d22";

/* -------------------------------------------------------------------------- */
/* Mini React Flow diagram                                                     */
/* -------------------------------------------------------------------------- */

type FlowNodeDef = {
  id: string;
  label: string;
  note?: string;
  /** Row, starting at 0 (top). */
  layer: number;
  /** Horizontal center as a fraction of the width (0–1). Default 0.5. */
  x?: number;
  /** Number shown in the badge. */
  index?: number;
  /** Highlighted with the brand color, like the accent node in the graph. */
  accent?: boolean;
};

type FlowDef = {
  nodes: FlowNodeDef[];
  edges: [source: string, target: string][];
};

type ChainItem = string | { label: string; note?: string };

/** Straight top-to-bottom chain. */
function chain(
  items: ChainItem[],
  opts?: {
    unnumberedFirst?: boolean;
    unnumbered?: boolean;
    /** Indexes of nodes to highlight. */
    accent?: number[];
  },
): FlowDef {
  const nodes: FlowNodeDef[] = items.map((item, i) => {
    const o = typeof item === "string" ? { label: item } : item;
    const skip = opts?.unnumbered || (opts?.unnumberedFirst && i === 0);
    return {
      id: `n${i}`,
      ...o,
      layer: i,
      accent: opts?.accent?.includes(i),
      index: skip ? undefined : opts?.unnumberedFirst ? i : i + 1,
    };
  });

  return {
    nodes,
    edges: nodes.slice(1).map((n, i) => [`n${i}`, n.id]),
  };
}

type StepData = {
  label: string;
  note?: string;
  index?: number;
  accent?: boolean;
  delay: number;
};

function StepNode({ data }: NodeProps<Node<StepData>>) {
  return (
    // The wrapper is never transformed, so React Flow measures the handles at
    // their real position. Animate only the inner element.
    <div className="relative h-full w-full">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !border-0 !bg-black/25 dark:!bg-white/25"
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: data.delay,
          type: "spring",
          stiffness: 320,
          damping: 26,
        }}
        className={[
          "flex h-full w-full items-center gap-2.5 rounded-xl border px-3",
          "bg-white text-black dark:bg-black dark:text-white",
          data.accent
            ? "border-2 border-[#733d22]/50"
            : "border-black/15 dark:border-white/15",
        ].join(" ")}
      >
        {data.index !== undefined && (
          <span
            className={[
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-medium",
              data.accent
                ? "border-[#733d22] bg-[#733d22] text-white"
                : "border-black/15 text-black/45 dark:border-white/15 dark:text-white/45",
            ].join(" ")}
          >
            {data.index}
          </span>
        )}

        <div className="min-w-0">
          <p
            className={`line-clamp-2 text-[11px] leading-tight tracking-tight sm:text-xs ${
              data.accent ? "font-bold" : "font-medium"
            }`}
          >
            {data.label}
          </p>
          {data.note && (
            <p className="truncate text-[9px] text-black/50 sm:text-[10px] dark:text-white/50">
              {data.note}
            </p>
          )}
        </div>
      </motion.div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1.5 !w-1.5 !border-0 !bg-black/25 dark:!bg-white/25"
      />
    </div>
  );
}

const flowNodeTypes = { step: StepNode };

type CenteredEdgeData = { sx: number; sy: number; tx: number; ty: number };

/**
 * Draws the connector from coordinates computed by our own layout (exact
 * bottom-center of the source box to exact top-center of the target box)
 * instead of from DOM-measured handle positions, which can drift while the
 * dialog is scaling/sliding in.
 */
function CenteredEdge({
  id,
  markerEnd,
  style,
  data,
}: EdgeProps<Edge<CenteredEdgeData>>) {
  const d = data!;
  const [path] = getSmoothStepPath({
    sourceX: d.sx,
    sourceY: d.sy,
    sourcePosition: Position.Bottom,
    targetX: d.tx,
    targetY: d.ty,
    targetPosition: Position.Top,
    borderRadius: 12,
  });

  return <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />;
}

const flowEdgeTypes = { centered: CenteredEdge };

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    setWidth(el.clientWidth);
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

function FlowCanvasInner({ flow }: { flow: FlowDef }) {
  const [ref, width] = useElementWidth<HTMLDivElement>();

  const metrics = useMemo(() => {
    const layers = Math.max(...flow.nodes.map((n) => n.layer)) + 1;

    const counts = new Map<number, number>();
    flow.nodes.forEach((n) =>
      counts.set(n.layer, (counts.get(n.layer) ?? 0) + 1),
    );
    const maxCols = Math.max(...counts.values());

    const pad = 12;
    const gapX = width < 420 ? 8 : 16;
    const nodeH = maxCols === 1 ? 46 : 58;
    // Generous vertical gap so every arrow (line + head) stays visible.
    const rowGap = nodeH + (maxCols === 1 ? 30 : 44);
    const rawW = (width - pad * 2 - (maxCols - 1) * gapX) / maxCols;
    const nodeW = Math.round(
      Math.min(maxCols === 1 ? 300 : 190, Math.max(88, rawW)),
    );

    return {
      pad,
      nodeH,
      rowGap,
      nodeW,
      height: pad * 2 + (layers - 1) * rowGap + nodeH,
    };
  }, [flow, width]);

  // Single source of truth for every box's position and size.
  const boxes = useMemo(() => {
    const { pad, nodeH, rowGap, nodeW } = metrics;

    return flow.nodes.map((n) => {
      const cx = (n.x ?? 0.5) * width;
      const x = Math.round(
        Math.min(
          Math.max(pad, cx - nodeW / 2),
          Math.max(pad, width - nodeW - pad),
        ),
      );
      return { def: n, x, y: pad + n.layer * rowGap, w: nodeW, h: nodeH };
    });
  }, [flow, metrics, width]);

  const nodes = useMemo<Node<StepData>[]>(
    () =>
      boxes.map(({ def, x, y, w, h }, i) => ({
        id: def.id,
        type: "step",
        position: { x, y },
        style: { width: w, height: h },
        draggable: false,
        selectable: false,
        data: {
          label: def.label,
          note: def.note,
          index: def.index,
          accent: def.accent,
          delay: 0.12 + i * 0.05,
        },
      })),
    [boxes],
  );

  const edges = useMemo<Edge<CenteredEdgeData>[]>(() => {
    const byId = new Map(boxes.map((b) => [b.def.id, b]));

    return flow.edges.map(([source, target]) => {
      const s = byId.get(source)!;
      const t = byId.get(target)!;

      return {
        id: `${source}-${target}`,
        source,
        target,
        type: "centered",
        animated: true,
        data: {
          sx: s.x + s.w / 2,
          sy: s.y + s.h,
          tx: t.x + t.w / 2,
          ty: t.y,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: ACCENT,
          width: 14,
          height: 14,
        },
        style: { stroke: ACCENT, strokeWidth: 1.5, opacity: 0.85 },
      };
    });
  }, [boxes, flow]);

  return (
    <div
      ref={ref}
      style={{ height: metrics.height }}
      // pointer-events-none: the diagram is display-only, so touch/wheel input
      // goes straight to the dialog's scroll area instead of being captured.
      className="pointer-events-none w-full overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-black"
    >
      {width > 0 && (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={flowNodeTypes}
          edgeTypes={flowEdgeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={1}
          maxZoom={1}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          panOnScroll={false}
          panOnDrag={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            gap={32}
            size={1}
            className="text-black/10 dark:text-white/10"
          />
        </ReactFlow>
      )}
    </div>
  );
}

/**
 * Each canvas gets its own provider so it never shares state with the
 * page-level pipeline graph (context flows through portals).
 */
function FlowCanvas({ flow }: { flow: FlowDef }) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner flow={flow} />
    </ReactFlowProvider>
  );
}

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-black/45 dark:text-white/45">
        {title}
      </h3>
      {children}
    </section>
  );
}

const preProcessFlow = chain(
  [
    "Input CSV file",
    "CSV Loader",
    "Data Cleaning",
    "Normalization",
    "Relationship Builder",
    "Braid Generator",
    "Braid Features",
    "Knot Features",
    "Braid Matrix",
    "Text",
  ],
  { unnumberedFirst: true, accent: [0] },
);

const irFlow = chain(
  [{ label: "Braid Matrix", note: "36 × 36" }, "QPhase IR"],
  { unnumbered: true, accent: [1] },
);

const executionFlow: FlowDef = {
  nodes: [
    { id: "ir", label: "QPhase IR", layer: 0, x: 0.5, accent: true },
    { id: "emu", label: "Emulator", note: "No noise", layer: 1, x: 1 / 6 },
    { id: "sim", label: "Simulator", note: "With noise", layer: 1, x: 0.5 },
    { id: "hw", label: "Hardware Adapters", layer: 1, x: 5 / 6 },
    { id: "sc", label: "Superconducting", layer: 2, x: 0.5 },
    { id: "ph", label: "Photonic", layer: 2, x: 5 / 6 },
  ],
  edges: [
    ["ir", "emu"],
    ["ir", "sim"],
    ["ir", "hw"],
    ["hw", "sc"],
    ["hw", "ph"],
  ],
};

const superconductingFlow = chain(
  ["QPhase IR", "Hardware Adapters", "Superconducting"],
  { unnumbered: true, accent: [2] },
);

const photonicFlow = chain(["QPhase IR", "Hardware Adapters", "Photonic"], {
  unnumbered: true,
  accent: [2],
});

const postProcessFlow = chain(
  [
    "Backend Results",
    "Normalization",
    "Probability Processing",
    "Metrics Engine",
    "Decision Engine",
    "Risk Engine",
    "Execution Report",
  ],
  { accent: [6] },
);

const applicationFlow: FlowDef = {
  nodes: [
    { id: "report", label: "Execution Report", layer: 0, x: 0.5, accent: true },
    { id: "fold", label: "FoldShield", layer: 1, x: 0.25 },
    { id: "omega", label: "Omega Signal", layer: 1, x: 0.75 },
  ],
  edges: [
    ["report", "fold"],
    ["report", "omega"],
  ],
};

/**
 * Extra dialog content per node id. Any ReactNode works here.
 * You can also set `details` on a node's `data` in baseNodes;
 * this map wins if both exist.
 */
export const nodeDetails: Record<string, ReactNode> = {
  algorithm: (
    <Section title="Pre-process engine">
      <FlowCanvas flow={preProcessFlow} />
    </Section>
  ),

  ir: (
    <div className="space-y-6">
      <Section title="Flow">
        <FlowCanvas flow={irFlow} />
      </Section>
      <Section title="QPhase IR format">
        <pre className="overflow-x-auto rounded-2xl border border-[#733d22]/30 bg-[#733d22]/[0.06] p-4 font-mono text-[11px] leading-relaxed text-black dark:text-white sm:text-xs">
{`QPHASE_BEGIN
qubits: 36
braid_matrix: [36x36]
features: {
  braid: ..,
  knot: ...
}
metadata: {
  source: "input.csv",
  timestamp: ..
}
QPHASE_END`}
        </pre>
      </Section>
    </div>
  ),

  compiler: (
    <Section title="Quantum execution engine">
      <FlowCanvas flow={executionFlow} />
    </Section>
  ),

  superconducting: (
    <Section title="Execution path">
      <FlowCanvas flow={superconductingFlow} />
    </Section>
  ),

  photonic: (
    <Section title="Execution path">
      <FlowCanvas flow={photonicFlow} />
    </Section>
  ),

  validation: (
    <Section title="Post-process engine">
      <FlowCanvas flow={postProcessFlow} />
    </Section>
  ),

  result: (
    <Section title="Application integration">
      <FlowCanvas flow={applicationFlow} />
    </Section>
  ),
};

/* -------------------------------------------------------------------------- */
/* Dialog                                                                      */
/* -------------------------------------------------------------------------- */

export type PipelineDialogItem = { id: string; data: PipelineNodeData };

function useIsMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return mobile;
}

const contentVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -32 }),
};

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

const navButton =
  "flex items-center gap-1 rounded-full border border-black/15 px-3 py-1.5 text-xs font-medium text-black/70 transition-colors hover:border-black/30 hover:text-black disabled:pointer-events-none disabled:opacity-30 dark:border-white/15 dark:text-white/70 dark:hover:border-white/30 dark:hover:text-white";

function DialogShell({
  items,
  selectedId,
  onSelect,
  onClose,
}: {
  items: PipelineDialogItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const controls = useDragControls();
  const isMobile = useIsMobile();
  const [dir, setDir] = useState(1);

  const index = Math.max(
    0,
    items.findIndex((i) => i.id === selectedId),
  );
  const item = items[index];

  const go = useCallback(
    (to: number) => {
      if (to < 0 || to >= items.length || to === index) return;
      setDir(to > index ? 1 : -1);
      onSelect(items[to].id);
    },
    [index, items, onSelect],
  );

  // Lock page scroll while open, restore focus on exit.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  // Escape closes, arrows navigate.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go, index, onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [selectedId]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
  };

  const hidden = isMobile
    ? { opacity: 1, y: "100%" }
    : { opacity: 0, scale: 0.94, y: 16 };

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pipeline-dialog-title"
          tabIndex={-1}
          initial={hidden}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ ...hidden, transition: { duration: 0.2, ease: "easeIn" } }}
          transition={{ type: "spring", damping: 28, stiffness: 320, mass: 0.8 }}
          drag={isMobile ? "y" : false}
          dragControls={controls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragEnd={onDragEnd}
          // Height is capped so the body can scroll on any screen size.
          className="relative z-10 flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-2xl border border-black/15 bg-white text-black shadow-2xl outline-none sm:max-h-[85dvh] sm:max-w-2xl sm:rounded-2xl dark:border-white/15 dark:bg-black dark:text-white"
        >
          {/* Accent bar */}
          <motion.div
            key={`bar-${item.id}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}00)`,
              transformOrigin: "left",
            }}
            className="h-1 w-full shrink-0"
          />

          {/* Header (drag handle on mobile) */}
          <header
            onPointerDown={(e) => isMobile && controls.start(e)}
            style={{ touchAction: isMobile ? "none" : undefined }}
            className="shrink-0 px-5 pt-3 sm:px-6 sm:pt-5"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-black/15 sm:hidden dark:bg-white/20" />

            <div className="flex items-center gap-3.5">
              <motion.div
                key={`badge-${item.id}`}
                initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#733d22]/50 bg-[#733d22] text-sm font-semibold text-white"
              >
                {item.data.number}
              </motion.div>

              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-[#733d22] px-2 py-0.5 text-[10px] font-medium text-white">
                  Step {index + 1} of {items.length}
                </span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.h2
                    key={item.id}
                    id="pipeline-dialog-title"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="mt-1 truncate text-lg font-semibold tracking-tight sm:text-xl"
                  >
                    {item.data.label}
                  </motion.h2>
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/15 text-black/60 transition-colors hover:border-black/30 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#733d22] dark:border-white/15 dark:text-white/60 dark:hover:border-white/30 dark:hover:text-white"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </header>

          {/* Body: scrolls whenever the content is taller than the dialog */}
          <div
            ref={scrollRef}
            style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-5 pb-5 pt-4 sm:px-6"
          >
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div
                key={item.id}
                custom={dir}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="min-w-0 space-y-6"
              >
                <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
                  {item.data.longDescription ?? item.data.description}
                </p>

                {item.data.details}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer navigation */}
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-black/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 dark:border-white/10">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className={navButton}
            >
              <Chevron dir="left" />
              Prev
            </button>

            <div className="flex items-center">
              {items.map((it, i) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to ${it.data.label}`}
                  aria-current={i === index}
                  className="p-1"
                >
                  <motion.span
                    className="block h-1.5 rounded-full bg-[#733d22]"
                    animate={{
                      width: i === index ? 18 : 6,
                      opacity: i === index ? 1 : 0.3,
                    }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(index + 1)}
              disabled={index === items.length - 1}
              className={navButton}
            >
              Next
              <Chevron dir="right" />
            </button>
          </footer>
        </motion.div>
      </div>
    </MotionConfig>
  );
}

export function PipelineDialog({
  items,
  selectedId,
  onSelect,
  onClose,
}: {
  items: PipelineDialogItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {selectedId && items.some((i) => i.id === selectedId) && (
        <DialogShell
          key="pipeline-dialog"
          items={items}
          selectedId={selectedId}
          onSelect={onSelect}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
