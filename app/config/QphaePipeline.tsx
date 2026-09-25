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
      label: "Quantum Algorithm",
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
      label: "QPhase IR",
      description:
        "The algorithm becomes a hardware-independent representation.",
      accent: true,
    },
  },
  {
    id: "compiler",
    type: "pipeline",
    position: { x: 0, y: 0 },
    data: {
      number: "03",
      label: "Compiler",
      description:
        "The same representation is mapped to the target hardware.",
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
      label: "Invariant Validation",
      description:
        "The compiled circuit is checked against the original physics.",
      accent: true,
    },
  },
  {
    id: "result",
    type: "pipeline",
    position: { x: 0, y: 0 },
    data: {
      number: "06",
      label: "Verified Result",
      description:
        "Only validated results move forward to execution.",
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