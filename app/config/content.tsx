import ProofPointVerification from "../sections/ProofPointVerification";
import WhatAPartnerGets from "../sections/scroll-sections/WhatAPartnerGets";

export interface NavItem {
  id: string;
  label: string;
}

export const navItems: NavItem[] = [
  { id: "verification", label: "Proof Point · Verification" },
  { id: "partner", label: "What a Partner Gets" },
];

export const pipelineSteps = {
  "Circuit IR": { desc: "Initail Process of working." },
  Decompose: { desc: "decompose the file" },
  Route: { desc: "desicde where the flow continues" },
  Optimize: { desc: "optimeze the data" },
  "Invariant Broker": { desc: "perform computation and workings" },
  Hardware: { desc: "making it compactable with hardware" },
} as const;

export const hero = {
  eyebrow: "QPhase × Rexcurx",
  title: "Write Your Quantum Algorithm Once.",
  static: ["Run", "Run", "Run on", "Run on"],
  endTexts: ["Anywhere.", "Everywhere.", "Any Hardware.", "Any Architecture."],
  pipelineNote:
    "Every compile is checked against the original circuit's own physics before it reaches hardware.",
  primaryCta: "Contact Us",
  footer: "RexCrux · September 2028",
};

export const ScrollSectionData = {
  verification: {
    headline: "Early Benchmark Results",
    body: "13 real benchmark circuits, compiled cross-checked between inhouse noise simulator and super conductive emulator.",
    stats: [
      {
        value: "13/13",
        label: "Broker-verified vs. real quantum emulator",
      },
      {
        value: "0.934",
        label: "Mean fidelity agreement across circuits",
      },
      {
        value: "4–10",
        label: "Qubit range actually measured",
      },
      {
        value: "4,096",
        label: "Shots per circuit, every run",
      },
    ],
    component: <ProofPointVerification />,
  },
};

export const status = [
  {
    label: "Supercondicated *", //done
    value: "Benchmarked",
  },
  {
    label: "Photonic *",
    value: "RND - Inprogress", // RND
  },
  {
    label: "Netural Atom *",
    value: "Upcomming",
  },
];
