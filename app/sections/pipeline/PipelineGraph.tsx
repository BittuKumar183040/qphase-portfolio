"use client";

import { baseEdges, baseNodes } from "@/app/config/QphaePipeline";
import { Background, ReactFlow, useReactFlow, type Node } from "@xyflow/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { PipelineNode, type PipelineNodeData } from "./PipelineNode";

export const nodeTypes = {
  pipeline: PipelineNode,
};

/* -------------------------------------------------------------------------- */
/* Flow diagram helpers (flexbox + arrows)                                     */
/* -------------------------------------------------------------------------- */

const tones = {
  blue: {
    box: "border-blue-600/30 bg-blue-600/5",
    badge: "bg-blue-600 text-white",
    title: "text-blue-700 dark:text-blue-400",
  },
  purple: {
    box: "border-purple-600/30 bg-purple-600/5",
    badge: "bg-purple-600 text-white",
    title: "text-purple-700 dark:text-purple-400",
  },
  orange: {
    box: "border-orange-500/30 bg-orange-500/5",
    badge: "bg-orange-500 text-white",
    title: "text-orange-700 dark:text-orange-400",
  },
  green: {
    box: "border-green-600/30 bg-green-600/5",
    badge: "bg-green-600 text-white",
    title: "text-green-700 dark:text-green-400",
  },
  red: {
    box: "border-red-600/30 bg-red-600/5",
    badge: "bg-red-600 text-white",
    title: "text-red-700 dark:text-red-400",
  },
} as const;

type Tone = keyof typeof tones;
type FlowItem = { label: string; note?: string };

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="12"
      height="20"
      viewBox="0 0 12 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 text-black/35 dark:text-white/35 ${className}`}
    >
      <path d="M6 1v16M2 13l4 4 4-4" />
    </svg>
  );
}

function FlowBox({
  item,
  tone,
  index,
  className = "",
}: {
  item: FlowItem;
  tone: Tone;
  index?: number;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 ${t.box} ${className}`}
    >
      {index !== undefined && (
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${t.badge}`}
        >
          {index}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium">{item.label}</p>
        {item.note && (
          <p className="text-[11px] text-black/50 dark:text-white/50">
            {item.note}
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold text-black/60 dark:text-white/60">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Vertical flex chain: box ↓ box ↓ box */
function FlowSteps({
  steps,
  tone,
  numbered = true,
}: {
  steps: FlowItem[];
  tone: Tone;
  numbered?: boolean;
}) {
  return (
    <div className="flex flex-col items-stretch">
      {steps.map((step, i) => (
        <div key={step.label} className="flex flex-col items-stretch">
          <FlowBox item={step} tone={tone} index={numbered ? i + 1 : undefined} />
          {i < steps.length - 1 && <Arrow className="my-0.5 self-center" />}
        </div>
      ))}
    </div>
  );
}

type Branch = FlowItem & { tone?: Tone; children?: (FlowItem & { tone?: Tone })[] };

/** Root box that fans out into branches (each may have its own children). */
function FlowBranch({
  root,
  branches,
  tone,
}: {
  root: FlowItem;
  branches: Branch[];
  tone: Tone;
}) {
  return (
    <div className="flex flex-col items-center">
      <FlowBox item={root} tone={tone} className="w-full sm:w-2/3" />
      <Arrow className="my-0.5" />
      <div className="flex w-full flex-wrap items-start justify-center gap-3">
        {branches.map((b) => (
          <div
            key={b.label}
            className="flex min-w-[8rem] flex-1 flex-col items-center"
          >
            <FlowBox item={b} tone={b.tone ?? tone} className="w-full" />
            {b.children && (
              <>
                <Arrow className="my-0.5" />
                <div className="flex w-full flex-wrap justify-center gap-2">
                  {b.children.map((c) => (
                    <FlowBox
                      key={c.label}
                      item={c}
                      tone={c.tone ?? b.tone ?? tone}
                      className="min-w-[7rem] flex-1"
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dialog content per node id                                                  */
/* -------------------------------------------------------------------------- */

const executionBranches: Branch[] = [
  { label: "Emulator", note: "No noise", tone: "blue" },
  { label: "Simulator", note: "With noise", tone: "orange" },
  {
    label: "Hardware Adapters",
    tone: "green",
    children: [{ label: "Superconducting" }, { label: "Photonic" }],
  },
];

/**
 * Extra dialog content per node id. Any ReactNode works here.
 * You can also set `details` directly on a node's `data` in baseNodes;
 * this map wins if both exist.
 */
const nodeDetails: Record<string, ReactNode> = {
  algorithm: (
    <div className="space-y-5">
      <Section title="Input">
        <FlowBox item={{ label: "Input CSV file" }} tone="blue" />
      </Section>
      <Section title="Pre-process engine">
        <FlowSteps
          tone="blue"
          steps={[
            { label: "CSV Loader" },
            { label: "Data Cleaning" },
            { label: "Normalization" },
            { label: "Relationship Builder" },
            { label: "Braid Generator" },
            { label: "Braid Features" },
            { label: "Knot Features" },
            { label: "Braid Matrix" },
            { label: "Text" },
          ]}
        />
      </Section>
    </div>
  ),

  ir: (
    <div className="space-y-5">
      <Section title="Flow">
        <FlowSteps
          tone="purple"
          numbered={false}
          steps={[
            { label: "Braid Matrix", note: "36 × 36" },
            { label: "QPhase IR" },
          ]}
        />
      </Section>
      <Section title="QPhase IR format">
        <pre className="overflow-x-auto rounded-lg border border-purple-600/30 bg-purple-600/5 p-3 font-mono text-[11px] leading-relaxed">
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
      <FlowBranch
        tone="orange"
        root={{ label: "QPhase IR" }}
        branches={executionBranches}
      />
    </Section>
  ),

  superconducting: (
    <Section title="Execution path">
      <FlowSteps
        tone="green"
        numbered={false}
        steps={[
          { label: "QPhase IR" },
          { label: "Hardware Adapters" },
          { label: "Superconducting" },
        ]}
      />
    </Section>
  ),

  photonic: (
    <Section title="Execution path">
      <FlowSteps
        tone="green"
        numbered={false}
        steps={[
          { label: "QPhase IR" },
          { label: "Hardware Adapters" },
          { label: "Photonic" },
        ]}
      />
    </Section>
  ),

  validation: (
    <Section title="Post-process engine">
      <FlowSteps
        tone="green"
        steps={[
          { label: "Backend Results" },
          { label: "Normalization" },
          { label: "Probability Processing" },
          { label: "Metrics Engine" },
          { label: "Decision Engine" },
          { label: "Risk Engine" },
          { label: "Execution Report" },
        ]}
      />
    </Section>
  ),

  result: (
    <Section title="Application integration">
      <FlowBranch
        tone="red"
        root={{ label: "Execution Report" }}
        branches={[{ label: "FoldShield" }, { label: "Omega Signal" }]}
      />
    </Section>
  ),
};

/* -------------------------------------------------------------------------- */
/* Dialog                                                                      */
/* -------------------------------------------------------------------------- */

function PipelineDialog({
  data,
  onClose,
}: {
  data: PipelineNodeData | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const open = data !== null;

  // Close on Escape, lock body scroll, move focus into the dialog.
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!data || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pipeline-dialog-title"
        tabIndex={-1}
        className={[
          "flex max-h-[85vh] w-full flex-col overflow-hidden outline-none",
          "rounded-t-2xl sm:max-w-xl sm:rounded-2xl",
          "border bg-white text-black dark:bg-black dark:text-white",
          data.accent
            ? "border-2 border-[#733d22]/50"
            : "border-black/15 dark:border-white/15",
        ].join(" ")}
      >
        <header className="flex items-start gap-3 border-b border-black/10 p-5 dark:border-white/10">
          <div
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium",
              data.accent
                ? "border-[#733d22]/50 text-[#733d22]"
                : "border-black/15 text-black/45 dark:border-white/15 dark:text-white/45",
            ].join(" ")}
          >
            {data.number}
          </div>

          <h2
            id="pipeline-dialog-title"
            className={`min-w-0 flex-1 text-lg font-semibold tracking-tight ${
              data.accent ? "text-[#733d22]" : ""
            }`}
          >
            {data.label}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-1 rounded-md p-1 text-black/50 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-[#733d22] dark:text-white/50 dark:hover:text-white"
          >
            <svg
              width="18"
              height="18"
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
        </header>

        <div className="space-y-4 overflow-y-auto p-5 text-sm leading-relaxed">
          <p className="text-black/70 dark:text-white/70">
            {data.longDescription ?? data.description}
          </p>

          {data.details ? (
            <div className="border-t border-black/10 pt-4 text-black/80 dark:border-white/10 dark:text-white/80">
              {data.details}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/* Graph                                                                       */
/* -------------------------------------------------------------------------- */

function PipelineGraph() {
  const { fitView } = useReactFlow();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const element = document.querySelector("[data-qphase-pipeline-graph]");

    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      setContainerSize({
        width,
        height,
      });
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => {
    const width = containerSize.width;

    if (!width) {
      return {
        nodes: baseNodes,
        direction: "vertical",
      };
    }

    if (width < 640) {
      const nodeWidth = Math.min(width - 48, 300);
      const x = Math.max((width - nodeWidth) / 2, 24);
      const gap = 105;

      const positions = {
        algorithm: { x, y: 0 },
        ir: { x, y: gap },
        compiler: { x, y: gap * 2 },
        superconducting: { x, y: gap * 3 },
        photonic: { x, y: gap * 4 },
        validation: { x, y: gap * 5 },
        result: { x, y: gap * 6 },
      };

      return {
        nodes: baseNodes.map((node) => ({
          ...node,
          position: positions[node.id as keyof typeof positions],
          style: {
            width: nodeWidth,
          },
        })),
        direction: "vertical",
      };
    }

    if (width < 1100) {
      const nodeWidth = Math.min(260, width * 0.38);
      const centerX = (width - nodeWidth) / 2;

      const positions = {
        algorithm: { x: centerX, y: 0 },
        ir: { x: centerX, y: 120 },
        compiler: { x: centerX, y: 240 },
        superconducting: { x: Math.max(24, width * 0.08), y: 380 },
        photonic: {
          x: Math.min(width - nodeWidth - 24, width * 0.92 - nodeWidth),
          y: 380,
        },
        validation: { x: centerX, y: 520 },
        result: { x: centerX, y: 640 },
      };

      return {
        nodes: baseNodes.map((node) => ({
          ...node,
          position: positions[node.id as keyof typeof positions],
          style: {
            width: nodeWidth,
          },
        })),
        direction: "vertical",
      };
    }

    const horizontalPadding = 48;
    const nodeWidth = Math.min(240, Math.max(190, width * 0.15));
    const gap = Math.max(40, width * 0.035);
    const totalWidth = nodeWidth * 5 + gap * 4;

    if (totalWidth > width - horizontalPadding * 2) {
      return {
        nodes: baseNodes.map((node) => ({
          ...node,
          position: {
            x: Math.max(24, (width - Math.min(260, width * 0.38)) / 2),
            y:
              {
                algorithm: 0,
                ir: 120,
                compiler: 240,
                superconducting: 380,
                photonic: 500,
                validation: 620,
                result: 740,
              }[node.id] ?? 0,
          },
          style: {
            width: Math.min(260, width * 0.38),
          },
        })),
        direction: "vertical",
      };
    }

    const startX = (width - totalWidth) / 2;

    const column = (index: number) => startX + index * (nodeWidth + gap);

    const positions = {
      algorithm: { x: column(0), y: 115 },
      ir: { x: column(1), y: 115 },
      compiler: { x: column(2), y: 115 },
      superconducting: { x: column(3), y: 35 },
      photonic: { x: column(3), y: 195 },
      validation: { x: column(4), y: 115 },
      result: { x: column(5), y: 115 },
    };

    return {
      nodes: baseNodes.map((node) => ({
        ...node,
        position: positions[node.id as keyof typeof positions],
        style: {
          width: nodeWidth,
        },
      })),
      direction: "horizontal",
    };
  }, [containerSize.width]);

  // Merge dialog details + keyboard "open" handler into each node's data.
  const nodes = useMemo(
    () =>
      layout.nodes.map((node) => {
        const data = node.data as PipelineNodeData;
        return {
          ...node,
          data: {
            ...data,
            details: nodeDetails[node.id] ?? data.details,
            onOpen: () => setSelectedId(node.id),
          },
        };
      }),
    [layout.nodes],
  );

  const selectedData = useMemo(
    () =>
      selectedId
        ? ((nodes.find((n) => n.id === selectedId)?.data as PipelineNodeData) ??
          null)
        : null,
    [nodes, selectedId],
  );

  const closeDialog = useCallback(() => setSelectedId(null), []);

  useEffect(() => {
    if (!containerSize.width) return;

    const frame = requestAnimationFrame(() => {
      fitView({
        padding:
          containerSize.width < 640
            ? 0.12
            : containerSize.width < 1100
              ? 0.1
              : 0.08,
        duration: 450,
        minZoom: 0.35,
        maxZoom: 1.1,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [containerSize.width, containerSize.height, layout.direction, fitView]);

  const edges = useMemo(
    () =>
      baseEdges.map((edge) => ({
        ...edge,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: "currentColor",
          strokeWidth: 1,
          opacity: 0.22,
        },
        className: "text-black dark:text-white",
      })),
    [],
  );

  return (
    <>
      <div
        data-qphase-pipeline-graph
        className="relative min-h-180 w-full flex-1 overflow-hidden rounded-2xl bg-white sm:min-h-162.5 md:min-h-140 lg:min-h-0 dark:border-white/10 dark:bg-black"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node: Node) => setSelectedId(node.id)}
          fitView
          fitViewOptions={{
            padding: 0.1,
            minZoom: 0.35,
            maxZoom: 1.1,
          }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          panOnScroll={false}
          panOnDrag={false}
          preventScrolling
          proOptions={{
            hideAttribution: true,
          }}
        >
          <Background
            gap={32}
            size={1}
            className="text-black/10 dark:text-white/10"
          />
        </ReactFlow>
      </div>

      <PipelineDialog data={selectedData} onClose={closeDialog} />
    </>
  );
}

export default PipelineGraph;
