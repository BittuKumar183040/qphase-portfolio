import { CoreItem } from "../sections/CoreSection";

// edit path : https://yqnn.github.io/svg-path-editor/

export const CORE_ITEMS: CoreItem[] = [
  {
    id: "left-top",
    side: "left",
    label: "AI Assistant",
    title:
      "Natural conversations powered by an intelligent on-device assistant.",
    width: 250,
    x: [40, 40, 10],
    y: [0, 40, 10],
    linePosition: 0.13,
    lineDuration: 1.4,
    lineEase: "power2.out",
  },
  {
    id: "left-mid",
    side: "left",
    label: "Safe Learning",
    title:
      "Age-appropriate experiences designed to encourage curiosity and growth.",
    width: 200,
    x: [-15, 36, 10],
    y: [40, 50, 32],
    linePosition: 0.14,
    lineDuration: 0.85,
    lineEase: "power1.inOut",
  },
  {
    id: "left-bottom",
    side: "left",
    label: "Parental Control",
    title:
      "Give parents complete visibility with flexible controls and screen-time management.",
    width: 220,
    x: [10, 28, 10],
    y: [55, 20, 54],
    linePosition: 0.28,
    lineDuration: 1.1,
    lineEase: "power3.out",
  },
  {
    id: "right-top",
    side: "right",
    label: "Interactive Display",
    title:
      "A vibrant, responsive interface built for immersive everyday learning.",
    width: 250,
    x: [80, 64, 90],
    y: [10, 20, 10],
    linePosition: 0.07,
    lineDuration: 0.95,
    lineEase: "power2.inOut",
  },
  {
    id: "right-mid",
    side: "right",
    label: "Premium Hardware",
    title:
      "Crafted with durable materials for reliability in every environment.",
    width: 290,
    x: [110, 66, 90],
    y: [50, 50, 32],
    linePosition: 0.21,
    lineDuration: 0.8,
    lineEase: "power1.out",
  },
  {
    id: "right-bottom",
    side: "right",
    label: "Always Connected",
    title:
      "Seamless updates, cloud sync, and responsive support whenever you need it.",
    width: 260,
    x: [95, 64, 90],
    y: [70, 80, 54],
    linePosition: 0.35,
    lineDuration: 1.05,
    lineEase: "power3.inOut",
  },
];
