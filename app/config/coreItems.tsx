import { CoreItem } from "../sections/CoreSection";

// edit path : https://yqnn.github.io/svg-path-editor/

export const CORE_ITEMS: CoreItem[] = [
  {
    id: "no-more-underselling",
    side: "left",
    label: "No more underselling your circuits.",
    title:
      "Predicts how accurate your result will be on real hardware — corrected for how your circuit actually behaves under noise.",
    width: 200,
    x: [18, 30, 8],
    y: [14, 10, 4],
  },
  {
    id: "one-compiler-several-chips",
    side: "left",
    label: "One compiler. several chips.",
    title:
      "Different Quantum Hardware — all from a single intermediate representation.",
    width: 220,
    x: [14, 24, 8],
    y: [40, 36, 30],
  },
  {
    id: "photonic-backend",
    side: "left",
    label: "Photonic Backend",
    title:
      "The new photonic backend discloses its 5-qubit ceiling upfront rather than rounding the number up.",
    width: 190,
    x: [16, 26, 8],
    y: [64, 58, 56],
  },
  {
    id: "invariant-broker",
    side: "right",
    label: "Invariant Broker",
    title:
      "Checks that the rewritten circuit still means the same thing as the original, every single time.",
    width: 200,
    x: [61, 64, 92],
    y: [16, 10, 4],
  },
  {
    id: "trusted-number",
    side: "right",
    label: "The number you can trust.",
    title: "Fixed the formula. Validated on real hardware.",
    width: 170,
    x: [86, 74, 92],
    y: [22, 22, 30],
  },
  {
    id: "prove-it-every-compile",
    side: "right",
    label: "Prove it. Every compile.",
    title: "Not just \"did it run\" — the physics, checked.",
    width: 170,
    x: [80, 70, 92],
    y: [48, 46, 56],
  },
  {
    id: "mps-scaling",
    side: "right",
    label: "MPS Scaling",
    title:
      "Past the exact-simulation ceiling, QPhase switches to matrix-product-state verification and reports an explicit error bound alongside every result.",
    width: 230,
    x: [84, 72, 92],
    y: [82, 80, 82],
  },
];