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

/**
 * Extra dialog content per node id. Put anything you want here (ReactNode).
 * You can also set `details` directly on a node's `data` in baseNodes;
 * this map wins if both exist.
 */
const nodeDetails: Record<string, ReactNode> = {
  algorithm: (
    <ul className="list-disc space-y-1.5 pl-4">
      <li>Input: quantum circuit or algorithm description</li>
      <li>Supports gate-based formulations</li>
    </ul>
  ),
  // ir: <YourComponent />,
  // compiler: ...,
  // superconducting: ...,
  // photonic: ...,
  // validation: ...,
  // result: ...,
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
          "rounded-t-2xl sm:max-w-lg sm:rounded-2xl",
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
