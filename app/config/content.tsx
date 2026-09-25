// content.tsx
// Single source of truth for all copy + data on the page.
// Edit this file to change what the page says — components only render it.

import DataMeasuredNotModeled from "../sections/scroll-sections/DataMeasuredNotModeled";
import HowItWorks from "../sections/scroll-sections/HowItWorks";
import ProofPointCrossPlatform from "../sections/scroll-sections/ProofPointCrossPlatform";
import ProofPointFidelityModel from "../sections/scroll-sections/ProofPointFidelityModel";
import ProofPointVerification from "../sections/scroll-sections/ProofPointVerification";
import StatusAndAsk from "../sections/scroll-sections/StatusAndAsk";
import TheApproach from "../sections/scroll-sections/TheApproach";
import WhatAPartnerGets from "../sections/scroll-sections/WhatAPartnerGets";

export interface NavItem {
  id: string;
  label: string;
}

export const navItems: NavItem[] = [
  { id: "approach", label: "The Approach" },
  { id: "howItWorks", label: "How It Works" },
  { id: "verification", label: "Proof Point · Verification" },
  { id: "fidelityModel", label: "Proof Point · The Fidelity Model" },
  { id: "dataSection", label: "Data · Measured, Not Modeled" },
  { id: "crossPlatform", label: "Proof Point · Cross-Platform" },
  { id: "partner", label: "What a Partner Gets" },
  { id: "statusAndAsk", label: "Status and the Ask" },
];

export const pipelineSteps = {
  "Circuit IR":{desc:"Initail Process of working."},
  "Decompose": {desc: "decompose the file"},
  "Route": {desc: "desicde where the flow continues"},
  "Optimize": {desc: "optimeze the data"},
  "Invariant Broker": {desc: "perform computation and workings"},
  "Hardware": {desc: "making it compactable with hardware"},
 } as const;



export const hero = {
  eyebrow: "QPhase × Rexcurx",
  title: "Write Your Quantum Algorithm Once.",
  static: ["Run", "Run", "Run on", "Run on"],
  endTexts: ["Anywhere.", "Everywhere.", "Any Hardware.", "Any Architecture."],
  pipelineNote: "Every compile is checked against the original circuit's own physics before it reaches hardware.",
  primaryCta: "See the Validation Data",
  secondaryCta: "Contact",
  footer: "RexCrux · September 2028",
};

export const mindMapNodes = [
  {
    title: "No more underselling your circuits.",
    body: "Predicts how accurate your result will be on real hardware, corrected for how your circuit actually behaves under noise.",
  },
  {
    title: "Invariant Broker",
    body: "Checks that the rewritten circuit still means the same thing as the original, every single time.",
  },
  {
    title: "Pass/fail, not guesswork.",
    chips: ["T", "F"],
  },
  {
    title: "One compiler. Seven chips.",
    body: "IBM, Rigetti, Google, IonQ, Pasqal, QuEra, and photonic — all from a single intermediate representation.",
  },
  {
    title: "Prove it. Every compile.",
    body: "Not just \"did it run\" — the physics, checked.",
  },
  {
    title: "Photonic backend",
    body: "The new photonic backend discloses its 5-qubit ceiling upfront rather than rounding the number up.",
  },
  {
    title: "Real numbers, not benchmark theatre.",
    body: "13 circuits, 4,096 shots each, cross-checked against IBM's own hardware emulator — 0.934 mean agreement.",
  },
  {
    title: "MPS scaling",
    body: "Past the exact-simulation ceiling, QPhase switches to matrix-product-state verification and reports an explicit error bound alongside every result.",
  },
];

export const ScrollSectionData = {
  "approach": {
    "kicker": "The Approach",
    "headline": "Verified end-to-end.",
    "body": "QPhase checks its own work against the original circuit's physics, every single compile.",
    "pullquote": "We call it the Invariant Broker. It's the one piece of this pitch that isn't a number — it's a discipline the rest of the deck is evidence for.",
    "footnote": [
      "Higher confidence",
      "Real advantage"
    ],
    "component": <TheApproach />
  },
  "howItWorks": {
    "headline": "One pipeline, one verification gate.",
    "body": "The Broker checks state fidelity, the Hamiltonian expectation (⟨H⟩) if you supply one, and entanglement entropy — before vs. after compilation, on the original circuit's own terms.",
    "highlightStep": "Invariant Broker",
    "component": <HowItWorks />
  },
  "verification": {
    "headline": "Verified, not asserted.",
    "body": "13 real benchmark circuits, compiled against IBM's actual 127-qubit device model, cross-checked between QPhase's own noise simulator and IBM's own hardware emulator.",
    "stats": [
      {
        "value": "13/13",
        "label": "Broker-verified vs. real IBM emulation"
      },
      {
        "value": "0.934",
        "label": "Mean fidelity agreement across circuits"
      },
      {
        "value": "4–10",
        "label": "Qubit range actually measured"
      },
      {
        "value": "4,096",
        "label": "Shots per circuit, every run"
      }
    ],
    "component": <ProofPointVerification />
  },
  "fidelityModel": {
    "headline": "Why the naive formula breaks down.",
    "bodyParagraphs": [
      "The naive formula predicted 0.36 fidelity for a real 8-qubit graph-state circuit. It actually measured 0.88 on hardware emulation — a 2.4× miss.",
      "The fix: a circuit's own output structure changes how much a given error actually matters. A highly-entangled circuit whose ideal answer is already spread across many outcomes is far more error-tolerant than \"any error = wrong\" assumes. We derived the correction, then validated it against real data before trusting it."
    ],
    "comparison": [
      {
        "label": "Naive formula predicted",
        "value": "0.36"
      },
      {
        "label": "Measured on hardware emulation",
        "value": "0.88"
      },
      {
        "label": "Size of the miss",
        "value": "2.4×"
      }
    ],
    "component": <ProofPointFidelityModel />
  },
  "dataSection": {
    "headline": "Measured, not modeled.",
    "bodyParagraphs": [
      "Every number on this page comes from running the actual circuit through IBM's own 127-qubit device emulator — not from a hand-tuned noise curve that happens to look plausible.",
      "QPhase logs the raw shot counts, the device calibration snapshot used, and the Broker's fidelity estimate side by side, so a partner can re-run the comparison and get the same answer we did."
    ],
    "logRows": [
      {
        "key": "Device model",
        "value": "ibm_torino (127q), calibration pinned per run"
      },
      {
        "key": "Shots",
        "value": "4,096 per circuit"
      },
      {
        "key": "Comparator",
        "value": "IBM Qiskit Aer noise-model emulator"
      },
      {
        "key": "Reported",
        "value": "Fidelity, ⟨H⟩ drift, entanglement entropy, error bound"
      }
    ],
    "component": <DataMeasuredNotModeled />
  },
  "crossPlatform": {
    "headline": "One compiler. Seven chips.",
    "body": "The same Circuit IR and the same Invariant Broker run underneath every backend — so a verified result on one chip means the same thing on the next.",
    "backends": [
      {
        "name": "IBM",
        "detail": "127-qubit superconducting, verified"
      },
      {
        "name": "Rigetti",
        "detail": "Superconducting, verified"
      },
      {
        "name": "Google",
        "detail": "Superconducting, verified"
      },
      {
        "name": "IonQ",
        "detail": "Trapped ion, verified"
      },
      {
        "name": "Pasqal",
        "detail": "Neutral atom, verified"
      },
      {
        "name": "QuEra",
        "detail": "Neutral atom, verified"
      },
      {
        "name": "Photonic",
        "detail": "5-qubit ceiling disclosed upfront"
      }
    ],
    "component": <ProofPointCrossPlatform />
  },
  "partner": {
    "headline": "What a partner gets.",
    "body": "Not a benchmark slide — a compiler you can point at your own circuits and trust the number that comes back.",
    "items": [
      {
        "title": "A fidelity number you can defend",
        "body": "Every result ships with the Broker's verification trace, not just a pass/fail."
      },
      {
        "title": "One integration, seven backends",
        "body": "Target any supported chip from the same Circuit IR without re-validating your pipeline each time."
      },
      {
        "title": "An explicit error bound past exact simulation",
        "body": "MPS scaling keeps verification honest even when circuits outgrow exact methods."
      },
      {
        "title": "Disclosure, not rounding",
        "body": "Backend limits — like the photonic path's 5-qubit ceiling — are stated upfront."
      }
    ],
    "component": <WhatAPartnerGets />
  },
  "statusAndAsk": {
    "headline": "Where this stands, and what we're asking for.",
    "bodyParagraphs": [
      "QPhase is validated against 13 real benchmark circuits on IBM hardware emulation today, with Rigetti and IonQ validation underway.",
      "We're looking for a design partner willing to run their own circuits through the Broker and hold us to the same standard we just held ourselves to."
    ],
    "status": [
      {
        "label": "IBM",
        "value": "Validated"
      },
      {
        "label": "Rigetti",
        "value": "In progress"
      },
      {
        "label": "IonQ",
        "value": "In progress"
      },
      {
        "label": "Photonic",
        "value": "5-qubit, disclosed"
      }
    ],
    "component": <StatusAndAsk />
  }
}