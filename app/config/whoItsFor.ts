// whoItsFor.ts

export type MediaType = "image" | "video";

export interface WhoItsForItem {
  title: string;
  desc: string;
  hoveredContentURL?: string;
  mediaType: MediaType;
}

export const eyebrow: string = "Who It's For";

export const heading = {
  line1: "Three Audiences,",
  line2: "One Shared Need.",
};

export const subHeading: string =
  "QPhase is an add-on layer — it fits alongside the tools teams already use, not a replacement for them.";

export const WHO_ITS_FOR: WhoItsForItem[] = [
  {
    title: "Quantum Software Teams",
    desc: "Already compiling circuits, testing whether QPhase does it better.",
    mediaType: "video",
  },
  {
    title: "Hardware & Cloud Providers",
    desc: "Want their chip to run more of the algorithm ecosystem, not less.",
    mediaType: "video",
  },
  {
    title: "Research Groups",
    desc: "Comparing performance across hardware paradigms for their own work.",
    mediaType: "video",
  },
];