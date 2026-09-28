"use client";

import {
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
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

/* -------------------------------------------------------------------------- */
/* Tones                                                                       */
/* -------------------------------------------------------------------------- */

const tones = {
  blue: {
    hex: "#2563eb",
    box: "border-blue-600/35 bg-blue-600/[0.07]",
    badge: "bg-blue-600 text-white",
    text: "text-blue-700 dark:text-blue-400",
  },
  purple: {
    hex: "#9333ea",
    box: "border-purple-600/35 bg-purple-600/[0.07]",
    badge: "bg-purple-600 text-white",
    text: "text-purple-700 dark:text-purple-400",
  },
  orange: {
    hex: "#f97316",
    box: "border-orange-500/35 bg-orange-500/[0.07]",
    badge: "bg-orange-500 text-white",
    text: "text-orange-700 dark:text-orange-400",
  },
  green: {
    hex: "#16a34a",
    box: "border-green-600/35 bg-green-600/[0.07]",
    badge: "bg-green-600 text-white",
    text: "text-green-700 dark:text-green-400",
  },
  red: {
    hex: "#dc2626",
    box: "border-red-600/35 bg-red-600/[0.07]",
    badge: "bg-red-600 text-white",
    text: "text-red-700 dark:text-red-400",
  },
} as const;

type Tone = keyof typeof tones;

/** Accent color of each node's dialog. Keys are node ids from baseNodes. */
const nodeTones: Record<string, Tone> = {
  algorithm: "blue",
  ir: "purple",
  compiler: "orange",
  superconducting: "green",
  photonic: "green",
  validation: "green",
  result: "red",
};

/* -------------------------------------------------------------------------- */
/* Mini React Flow diagram                                                     */
/* -------------------------------------------------------------------------- */

type FlowNodeDef = {
  id: string;
  label: string;
  note?: string;
  tone: Tone;
  /** Row, starting at 0 (top). */
  layer: number;
  /** Horizontal center as a fraction of the width (0–1). Default 0.5. */
  x?: number;
  /** Number shown in the badge. */
  index?: number;
};

type FlowDef = {
  nodes: FlowNodeDef[];
  edges: [source: string, target: string][];
};

type ChainItem = string | { label: string; note?: string };

/** Straight top-to-bottom chain. */
function chain(
  items: ChainItem[],
  tone: Tone,
  opts?: { unnumberedFirst?: boolean; unnumbered?: boolean },
): FlowDef {
  const nodes: FlowNodeDef[] = items.map((item, i) => {
    const o = typeof item === "string" ? { label: item } : item;
    const skip = opts?.unnumbered || (opts?.unnumberedFirst && i === 0);
    return {
      id: `n${i}`,
      ...o,
      tone,
      layer: i,
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
  tone: Tone;
  index?: number;
  delay: number;
};

function StepNode({ data }: NodeProps<Node<StepData>>) {
  const t = tones[data.tone];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{
        delay: data.delay,
        type: "spring",
        stiffness: 320,
        damping: 24,
      }}
      className="h-full w-full rounded-lg bg-white dark:bg-black"
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1 !w-1 !border-0 !bg-transparent"
      />

      <div
        className={`flex h-full items-center gap-2 rounded-lg border px-2.5 ${t.box}`}
      >
        {data.index !== undefined && (
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${t.badge}`}
          >
            {data.index}
          </span>
        )}
        <div className="min-w-0">
          <p className="line-clamp-2 text-[11px] font-medium leading-tight sm:text-xs">
            {data.label}
          </p>
          {data.note && (
            <p className="truncate text-[10px] text-black/50 dark:text-white/50">
              {data.note}
            </p>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1 !w-1 !border-0 !bg-transparent"
      />
    </motion.div>
  );
}

const flowNodeTypes = { step: StepNode };

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

    const pad = 8;
    const gapX = width < 420 ? 8 : 16;
    const nodeH = maxCols === 1 ? 44 : 56;
    const rowGap = nodeH + (maxCols === 1 ? 24 : 36);
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

  const nodes = useMemo<Node<StepData>[]>(() => {
    const { pad, nodeH, rowGap, nodeW } = metrics;

    return flow.nodes.map((n, i) => {
      const cx = (n.x ?? 0.5) * width;
      const x = Math.min(
        Math.max(pad, cx - nodeW / 2),
        Math.max(pad, width - nodeW - pad),
      );

      return {
        id: n.id,
        type: "step",
        position: { x, y: pad + n.layer * rowGap },
        style: { width: nodeW, height: nodeH },
        draggable: false,
        selectable: false,
        data: {
          label: n.label,
          note: n.note,
          tone: n.tone,
          index: n.index,
          delay: 0.15 + i * 0.06,
        },
      };
    });
  }, [flow, metrics, width]);

  const edges = useMemo<Edge[]>(
    () =>
      flow.edges.map(([source, target]) => {
        const color = tones[flow.nodes.find((n) => n.id === target)!.tone].hex;
        return {
          id: `${source}-${target}`,
          source,
          target,
          type: "smoothstep",
          animated: true,
          pathOptions: { borderRadius: 12 },
          markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
          style: { stroke: color, strokeWidth: 1.5, opacity: 0.7 },
        };
      }),
    [flow],
  );

  return (
    <div
      ref={ref}
      style={{ height: metrics.height }}
      className="w-full overflow-hidden rounded-xl border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03] [&_.react-flow__pane]:!touch-pan-y"
    >
      {width > 0 && (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={flowNodeTypes}
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
        />
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
  "blue",
  { unnumberedFirst: true },
);

const irFlow = chain(
  [{ label: "Braid Matrix", note: "36 × 36" }, "QPhase IR"],
  "purple",
  { unnumbered: true },
);

const executionFlow: FlowDef = {
  nodes: [
    { id: "ir", label: "QPhase IR", tone: "orange", layer: 0, x: 0.5 },
    { id: "emu", label: "Emulator", note: "No noise", tone: "blue", layer: 1, x: 1 / 6 },
    { id: "sim", label: "Simulator", note: "With noise", tone: "orange", layer: 1, x: 0.5 },
    { id: "hw", label: "Hardware Adapters", tone: "green", layer: 1, x: 5 / 6 },
    { id: "sc", label: "Superconducting", tone: "green", layer: 2, x: 0.5 },
    { id: "ph", label: "Photonic", tone: "green", layer: 2, x: 5 / 6 },
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
  "green",
  { unnumbered: true },
);

const photonicFlow = chain(
  ["QPhase IR", "Hardware Adapters", "Photonic"],
  "green",
  { unnumbered: true },
);

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
  "green",
);

const applicationFlow: FlowDef = {
  nodes: [
    { id: "report", label: "Execution Report", tone: "red", layer: 0, x: 0.5 },
    { id: "fold", label: "FoldShield", tone: "red", layer: 1, x: 0.25 },
    { id: "omega", label: "Omega Signal", tone: "red", layer: 1, x: 0.75 },
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
        <pre className="overflow-x-auto rounded-xl border border-purple-600/30 bg-purple-600/[0.06] p-4 font-mono text-[11px] leading-relaxed sm:text-xs">
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
  const tone = tones[nodeTones[item.id] ?? "blue"];

  const go = useCallback(
    (to: number) => {
      if (to < 0 || to >= items.length || to === index) return;
      setDir(to > index ? 1 : -1);
      onSelect(items[to].id);
    },
    [index, items, onSelect],
  );

  // Escape closes, arrows navigate. Lock body scroll, restore focus on exit.
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
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
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
          className="relative z-10 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white text-black shadow-2xl outline-none ring-1 ring-black/10 sm:max-w-2xl sm:rounded-3xl dark:bg-neutral-950 dark:text-white dark:ring-white/10"
        >
          {/* Accent bar */}
          <motion.div
            key={`bar-${item.id}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              background: `linear-gradient(90deg, ${tone.hex}, ${tone.hex}00)`,
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
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold shadow-sm ${tone.badge}`}
              >
                {item.data.number}
              </motion.div>

              <div className="min-w-0 flex-1">
                <p className={`text-[11px] font-medium ${tone.text}`}>
                  Step {index + 1} of {items.length}
                </p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.h2
                    key={item.id}
                    id="pipeline-dialog-title"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="truncate text-lg font-semibold tracking-tight sm:text-xl"
                  >
                    {item.data.label}
                  </motion.h2>
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-black/60 transition-colors hover:bg-black/10 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/15 dark:hover:text-white"
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

          {/* Body */}
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-4 sm:px-6"
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
                className="space-y-6"
              >
                <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
                  {item.data.longDescription ?? item.data.description}
                </p>

                {item.data.details}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer navigation */}
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-black/10 px-4 py-3 sm:px-5 dark:border-white/10">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-black/70 transition-colors hover:bg-black/5 disabled:pointer-events-none disabled:opacity-30 dark:text-white/70 dark:hover:bg-white/10"
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
                    className="block h-1.5 rounded-full"
                    style={{ backgroundColor: tone.hex }}
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
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-black/70 transition-colors hover:bg-black/5 disabled:pointer-events-none disabled:opacity-30 dark:text-white/70 dark:hover:bg-white/10"
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
