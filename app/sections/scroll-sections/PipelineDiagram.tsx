"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { pipelineSteps } from "@/app/config/content";

interface PipelineDiagramProps {
  highlight?: string;
}

const NODE_WIDTH = 152;
const NODE_HEIGHT = 40;
const COL_GAP = 48;
const ROW_GAP = 72; // extra room for the "wrap" connector dropping to the next row

type StepData = {
  label: string;
  desc: string;
  active: boolean;
  open: boolean;
  onToggle: (id: string) => void;
};

function StepNode({ id, data }: NodeProps<Node<StepData>>) {
  const { label, desc, active, open, onToggle } = data;
  return (
    <div style={{ width: NODE_WIDTH, height: NODE_HEIGHT }} className="relative">
      <Handle type="target" position={Position.Left} id="left-target" className="!opacity-0" />
      <Handle type="target" position={Position.Top} id="top-target" className="!opacity-0" />
      <Handle type="source" position={Position.Right} id="right-source" className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!opacity-0" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(id);
        }}
        style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
        className={
          "flex items-center justify-center rounded-sm border px-3 text-sm tracking-wide transition-colors duration-300 " +
          (active
            ? "border-[#8C4A2A] bg-[#8C4A2A] text-[#F6F3EE] shadow-[0_0_0_4px_rgba(140,74,42,0.15)]"
            : "border-[#D8D2C4] text-[#3A362E] hover:border-[#8C4A2A]/60")
        }
      >
        {label}
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-sm border border-[#D8D2C4] bg-[#F6F3EE] p-3 text-left text-xs text-[#3A362E] shadow-lg">
          <div className="mb-1 font-medium">{label}</div>
          <div className="text-[#6b675c]">{desc}</div>
        </div>
      )}
    </div>
  );
}

const nodeTypes = { step: StepNode };

export default function PipelineDiagram({
  highlight = "Invariant Broker",
}: PipelineDiagramProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  // pipelineSteps is keyed by step name -> { desc }. Derived here (at render
  // time, not module load time) so it never races the config module's own
  // initialization.
  const stepNames = useMemo(
    () => Object.keys(pipelineSteps) as (keyof typeof pipelineSteps)[],
    []
  );

  const toggleOpen = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Flex-wrap logic: fit as many boxes per row as the available width allows,
  // then wrap — same rule flex-wrap uses, just computed for fixed node sizes.
  const cols = Math.max(1, Math.floor((containerWidth + COL_GAP) / (NODE_WIDTH + COL_GAP)));
  const rows = Math.ceil(stepNames.length / cols);

  const activeIndex = stepNames.findIndex((s) => s === highlight);

  const nodes: Node<StepData>[] = useMemo(
    () =>
      stepNames.map((step, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        return {
          id: step,
          type: "step",
          position: { x: col * (NODE_WIDTH + COL_GAP), y: row * (NODE_HEIGHT + ROW_GAP) },
          data: {
            label: step,
            desc: pipelineSteps[step].desc,
            active: step === highlight,
            open: openId === step,
            onToggle: toggleOpen,
          },
          draggable: false,
          selectable: false,
          focusable: false,
        };
      }),
    [cols, highlight, openId, toggleOpen]
  );

  const edges: Edge[] = useMemo(
    () =>
      stepNames.slice(0, -1).map((step, i) => {
        const traveled = activeIndex > -1 && i < activeIndex;
        const leadingToActive = i === activeIndex - 1;
        const sameRow = Math.floor(i / cols) === Math.floor((i + 1) / cols);
        return {
          id: `${step}->${stepNames[i + 1]}`,
          source: step,
          target: stepNames[i + 1],
          sourceHandle: sameRow ? "right-source" : "bottom-source",
          targetHandle: sameRow ? "left-target" : "top-target",
          type: "smoothstep",
          animated: leadingToActive,
          focusable: false,
          selectable: false,
          interactionWidth: 0, // edges are purely decorative — no clicks/hover
          style: { stroke: traveled ? "#8C4A2A" : "#D8D2C4", strokeWidth: 1.5 },
        };
      }),
    [cols, activeIndex]
  );

  const height = rows * NODE_HEIGHT + (rows - 1) * ROW_GAP + 8;

  return (
    <div ref={wrapperRef} style={{ height, overflow: "visible" }} className="w-full">
      {/* xyflow clips descendants by default; the tooltip and the wrap
          connector both need to be able to spill past the canvas edge.
          The pane also swaps to a rubber-band-select crosshair whenever
          panOnDrag is off, so its cursor and drag behavior get pinned
          down explicitly here too. */}
      <style>{`
        .pipeline-flow .react-flow__renderer,
        .pipeline-flow .react-flow__pane,
        .pipeline-flow.react-flow {
          overflow: visible;
        }
        .pipeline-flow .react-flow__edge {
          pointer-events: none;
        }
        .pipeline-flow .react-flow__pane {
          cursor: default !important;
        }
        .pipeline-flow .react-flow__selection {
          display: none;
        }
      `}</style>
      <ReactFlow
        className="pipeline-flow"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={1}
        maxZoom={1}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        selectionOnDrag={false}
        selectNodesOnDrag={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        onPaneClick={() => setOpenId(null)}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}