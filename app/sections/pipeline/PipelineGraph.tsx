"use client";

import { baseEdges, baseNodes } from "@/app/config/QphaePipeline";
import {
  Background,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import { PipelineNode } from "./PipelineNode";


export const nodeTypes = {
  pipeline: PipelineNode,
};

function PipelineGraph() {
  const { fitView } = useReactFlow();

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
        photonic: { x: Math.min(width - nodeWidth - 24, width * 0.92 - nodeWidth), y: 380 },
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

  const nodes = layout.nodes;

  useEffect(() => {
    if (!containerSize.width) return;

    const frame = requestAnimationFrame(() => {
      fitView({
        padding: containerSize.width < 640 ? 0.12 : containerSize.width < 1100 ? 0.1 : 0.08,
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
    <div
      data-qphase-pipeline-graph
      className="relative min-h-180 w-full flex-1 overflow-hidden rounded-2xl bg-white sm:min-h-162.5 md:min-h-140 lg:min-h-0 dark:border-white/10 dark:bg-black"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
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
  );
}

export default PipelineGraph;