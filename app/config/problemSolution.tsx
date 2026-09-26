export type StyledText = {
  text: string;
  styled?: string;
};

export type                                                                    ProblemItem = {
  number: string;
  title: string;
  body: string;
};

export type SolutionItem = {
  number: string;
  title: string;
  body: string;
};

export const ProblemSolutionData = {
  problem: {
    eyebrow: "THE PROBLEM",

    title: {
      text: "Every quantum chip speaks a different language",
      styled: "different language",
    },

    body: {
      text: "Write an algorithm for one quantum computer, and it doesn't just run slower on another kind — it usually has to be rebuilt from scratch.",
      styled: "rebuilt from scratch",
    },

    items: [
      {
        number: "01",
        title: "Superconducting",
        body: "IBM, Google, Rigetti — today's most common quantum hardware family.",
      },
      {
        number: "02",
        title: "Neutral-Atom",
        body: "Pasqal, QuEra — a fast-growing alternative approach to quantum computing.",
      },
      {
        number: "03",
        title: "Photonic",
        body: "Xanadu and others — light-based quantum computing with a different architecture.",
      },
    ] satisfies ProblemItem[],

    footer:
      "Three different hardware families. Today, three different rewrites of the same algorithm.",
  },

  solution: {
    eyebrow: "THE SOLUTION",

    title: {
      text: "One compiler. Every hardware family.",
      styled: "Every hardware family.",
    },

    body: {
      text: "QPhase takes an algorithm once and compiles it into a single, hardware-independent form — then maps that same form onto whichever chip you're targeting.",
      styled: "hardware-independent form",
    },

    items: [
      {
        number: "01",
        title: "Write once",
        body: "No separate rewrite for every hardware family.",
      },
      {
        number: "02",
        title: "Prove correctness",
        body: "An automated checker confirms the compiled circuit still computes the same answer.",
      },
      {
        number: "03",
        title: "Ready for what's next",
        body: "New hardware backends plug in without changing the rest of the pipeline.",
      },
    ] satisfies SolutionItem[],

    footer: {
      items: ["Write", "Compile", "Verify", "Run"],
    },
  },
} as const;