import type { Edge, Node } from "@xyflow/react";
import type { ReactNode } from "react";
import { Axis3d, BroomSparkles, ChartColumnBig, ChartColumnStacked, ChartLine, ChartNoAxesColumnIncreasing, CircleGauge, Cpu, Database, FileChartColumn, LayoutList, MemoryStick, Omega, Scale, Section, ShieldAlert, SquareTerminal, VectorSquare, type LucideIcon } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Top-level pipeline graph                                                    */
/* -------------------------------------------------------------------------- */

export type PipelineNodeData = {
  number: string;
  label: string;
  description: string;
  longDescription?: string;
  /** Extra dialog content (a `nodeDetails` entry wins over this). */
  details?: ReactNode;
  /** Optional logo, e.g. "/pipeline/compiler.svg". */
  logo?: string | LucideIcon;
  accent?: boolean;
  /** Injected by PipelineGraph so a node can be opened with the keyboard. */
  onOpen?: () => void;
};

export type PipelineNode = Node<PipelineNodeData>;

const node = (
  id: string,
  data: PipelineNodeData,
): PipelineNode => ({ id, type: "pipeline", position: { x: 0, y: 0 }, data });

export const baseNodes: PipelineNode[] = [
  node("algorithm", {
    number: "01",
    label: "Problem Input",
    description:
      "Write the algorithm once without targeting a specific quantum chip.",
    logo: FileChartColumn,
  }),
  node("ir", {
    number: "02",
    label: "Pre-Processing",
    description: "QPhase Intermediate Representation",
    logo: BroomSparkles,
  }),
  node("compiler", {
    number: "03",
    label: "QPhase / Compiler",
    description: "Quantum Execution Engine",
    logo: "./asset/Logo.svg",
    accent: true,
  }),
  node("superconducting", {
    number: "04A",
    label: "Superconducting",
    description: "Optimized for superconducting quantum processors.",
    logo: MemoryStick,
  }),
  node("photonic", {
    number: "04B",
    label: "Photonic",
    description: "Translated for photonic quantum architectures.",
  }),
  node("validation", {
    number: "05",
    label: "Post-Process Engine",
    description:
    "Processing operations include Backend Results, Normalization, Metrics Engine, Risk Engine and Execution Report.",
    logo: ChartNoAxesColumnIncreasing,
  }),
  node("result", {
    number: "06",
    label: "Application Integration",
    description:
    "Allows work across different applications such as FoldShield and Omega Signal.",
    logo: LayoutList,
  }),
];

const link = (source: string, target: string): Edge => ({
  id: `${source}-${target}`,
  source,
  target,
});

export const baseEdges: Edge[] = [
  link("algorithm", "ir"),
  link("ir", "compiler"),
  link("compiler", "superconducting"),
  link("compiler", "photonic"),
  link("superconducting", "validation"),
  link("photonic", "validation"),
  link("validation", "result"),
];

/* -------------------------------------------------------------------------- */
/* Steps used inside the dialog diagrams                                       */
/* -------------------------------------------------------------------------- */

export type StepDef = {
  label: string;
  /** Subtitle shown under the label. */
  description?: string;
  /** Logo shown on the right, e.g. "/pipeline/steps/csv.svg". Falls back to a default glyph. */
  logo?: string | LucideIcon;
};

/** One place to edit a step's text/logo; every diagram reuses it. */
export const steps = {
  inputCsv: { label: "Input CSV file", description: "Raw dataset", logo: FileChartColumn},
  // csvLoader: { label: "CSV Loader", description: "Reads and validates rows" },
  dataCleaning: { label: "Data Cleaning", description: "Fixes missing values", logo: BroomSparkles},
  normalization: { label: "Normalization", description: "Scales the features", logo:  ChartColumnBig},
  // relationshipBuilder: { label: "Relationship Builder", description: "Links related signals" },
  braidGenerator: { label: "Braid Generator", description: "Encodes links as braids", logo: Section},
  braidFeatures: { label: "Braid Features", description: "Braid metrics", logo: ChartColumnStacked},
  knotFeatures: { label: "Knot Features", description: "Knot invariants", logo: VectorSquare },
  braidMatrix: { label: "Braid Matrix", description: "36 × 36" , logo: "/pipeline/braid-diagram.png"},

  qphaseIr: { label: "QPhase IR", description: "Intermediate representation", logo: "./asset/Logo.svg"},
  emulator: { label: "Emulator", description: "No noise", logo: ChartLine },
  simulator: { label: "Simulator", description: "With noise", logo: SquareTerminal },
  hardwareAdapters: { label: "Hardware Adapters", description: "Device backends", logo: Cpu},
  superconducting: { label: "Superconducting", description: "Superconducting chips", logo: MemoryStick },
  photonic: { label: "Photonic", description: "Photonic chips" },

  backendResults: { label: "Backend Results", description: "Raw measurements", logo: Database },
  postNormalization: { label: "Normalization", description: "Standardizes counts", logo: ChartNoAxesColumnIncreasing },
  probabilityProcessing: { label: "Probability Processing", description: "Counts to probabilities", logo: Axis3d },
  metricsEngine: { label: "Metrics Engine", description: "Quality metrics", logo: CircleGauge },
  decisionEngine: { label: "Decision Engine", description: "Applies rules", logo: Scale },
  riskEngine: { label: "Risk Engine", description: "Risk scoring", logo: ShieldAlert },
  executionReport: { label: "Execution Report", description: "Final summary", logo: LayoutList },

  foldShield: { label: "FoldShield", description: "Application" },
  omegaSignal: { label: "Omega Signal", description: "Application", logo: Omega },
} satisfies Record<string, StepDef>;

export type StepKey = keyof typeof steps;

/* -------------------------------------------------------------------------- */
/* Diagram definitions                                                         */
/* -------------------------------------------------------------------------- */

export type FlowNodeDef = StepDef & {
  id: string;
  /** Row, starting at 0 (top). */
  layer: number;
  /** Horizontal center as a fraction of the width (0-1). Default 0.5. */
  x?: number;
  /** Number shown in the badge. */
  index?: number;
  /** Highlighted with the brand color. */
  accent?: boolean;
};

export type FlowDef = {
  nodes: FlowNodeDef[];
  edges: [source: string, target: string][];
};

/** Straight top-to-bottom chain of steps. */
function chain(
  keys: StepKey[],
  opts?: {
    unnumberedFirst?: boolean;
    unnumbered?: boolean;
    /** Indexes of nodes to highlight. */
    accent?: number[];
  },
): FlowDef {
  const nodes: FlowNodeDef[] = keys.map((key, i) => {
    const skip = opts?.unnumbered || (opts?.unnumberedFirst && i === 0);
    return {
      id: key,
      ...steps[key],
      layer: i,
      accent: opts?.accent?.includes(i),
      index: skip ? undefined : opts?.unnumberedFirst ? i : i + 1,
    };
  });

  return { nodes, edges: nodes.slice(1).map((n, i) => [nodes[i].id, n.id]) };
}

const at = (
  key: StepKey,
  layer: number,
  x = 0.5,
  accent?: boolean,
): FlowNodeDef => ({ id: key, ...steps[key], layer, x, accent });

export const preProcessFlow = chain(
  [
    "inputCsv",
    "dataCleaning",
    "normalization",
    "braidGenerator",
    "braidFeatures",
    "knotFeatures",
    "braidMatrix"
  ],
  { unnumberedFirst: true, accent: [0, 6] },
);

export const irFlow = chain(["braidMatrix", "qphaseIr"], {
  unnumbered: true,
  accent: [0],
});

export const executionFlow: FlowDef = {
  nodes: [
    at("qphaseIr", 0, 0.5, true),
    at("emulator", 1, 1 / 6),
    at("simulator", 1, 0.5),
    at("hardwareAdapters", 1, 5 / 6),
    at("superconducting", 2, 0.5),
    at("photonic", 2, 5 / 6),
  ],
  edges: [
    ["qphaseIr", "emulator"],
    ["qphaseIr", "simulator"],
    ["qphaseIr", "hardwareAdapters"],
    ["hardwareAdapters", "superconducting"],
    ["hardwareAdapters", "photonic"],
  ],
};

export const superconductingFlow = chain(
  ["qphaseIr", "hardwareAdapters", "superconducting"],
  { unnumbered: true, accent: [2] },
);

export const photonicFlow = chain(["qphaseIr", "hardwareAdapters", "photonic"], {
  unnumbered: true,
  accent: [2],
});

export const postProcessFlow = chain(
  [
    "backendResults",
    "postNormalization",
    "probabilityProcessing",
    "metricsEngine",
    "decisionEngine",
    "riskEngine",
    "executionReport",
  ],
  { accent: [6] },
);

export const applicationFlow: FlowDef = {
  nodes: [
    at("executionReport", 0, 0.5, true),
    at("foldShield", 1, 0.25),
    at("omegaSignal", 1, 0.75),
  ],
  edges: [
    ["executionReport", "foldShield"],
    ["executionReport", "omegaSignal"],
  ],
};