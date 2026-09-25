import type { Edge, Node } from "@xyflow/react";

export type PipelineNodeData = {
  number: string;
  label: string;
  description: string;
  accent?: boolean;
};

export type PipelineNode = Node<PipelineNodeData>;

export const baseNodes: PipelineNode[] = [
  {
    id: "algorithm",
    type: "pipeline",
    position: { x: 0, y: 0 },
    data: {
      number: "01",
      label: "Problem Input",
      description:
        "Write the algorithm once without targeting a specific quantum chip.",
    },
  },
  {
    id: "ir",
    type: "pipeline",
    position: { x: 0, y: 0 },
    data: {
      number: "02",
      label: "Pre-Processing",
      description:
        "QPhase Intermediate Representation",
      accent: true,
    },
  },
  {
    id: "compiler",
    type: "pipeline",
    position: { x: 0, y: 0 },
    data: {
      number: "03",
      label: "QPhase / Compiler ",
      description:
        "Quantum Execution Engine",
      accent: true,
    },
  },
  {
    id: "superconducting",
    type: "pipeline",
    position: { x: 0, y: 0 },
    data: {
      number: "04A",
      label: "Superconducting",
      description:
        "Optimized for superconducting quantum processors.",
    },
  },
  {
    id: "photonic",
    type: "pipeline",
    position: { x: 0, y: 0 },
    data: {
      number: "04B",
      label: "Photonic",
      description:
        "Translated for photonic quantum architectures.",
    },
  },
  {
    id: "validation",
    type: "pipeline",
    position: { x: 0, y: 0 },
    data: {
      number: "05",
      label: "Post-Process Engine",
      description:
        "Do processing operation includes Backend Results, Normalization, Metrics Engine, Risk Engine, Exeution Report",
      accent: true,
    },
  },
  {
    id: "result",
    type: "pipeline",
    position: { x: 0, y: 0 },
    data: {
      number: "06",
      label: "Application Integration",
      description:
        "Allowing to work on different application such as FoldShild and Omega Signal.",
      accent: true,
    },
  },
];

export const baseEdges: Edge[] = [
  {
    id: "algorithm-ir",
    source: "algorithm",
    target: "ir",
  },
  {
    id: "ir-compiler",
    source: "ir",
    target: "compiler",
  },
  {
    id: "compiler-superconducting",
    source: "compiler",
    target: "superconducting",
  },
  {
    id: "compiler-photonic",
    source: "compiler",
    target: "photonic",
  },
  {
    id: "superconducting-validation",
    source: "superconducting",
    target: "validation",
  },
  {
    id: "photonic-validation",
    source: "photonic",
    target: "validation",
  },
  {
    id: "validation-result",
    source: "validation",
    target: "result",
  },
];