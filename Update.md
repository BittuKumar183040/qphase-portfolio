# Local Development and Website Content Updates

## Run the Website Locally

1. Open a terminal in the repository root.
2. Install dependencies if required by the project, for example:
   - `npm install`
3. Start the local development server:
   - `npm run dev`
4. Open the local URL shown in the terminal, usually `http://localhost:3000`.

## Update Website Content Using `config` Folder Files

The site content is driven by files stored in the `config` folder.

1. Open the `config` folder in your editor.
2. Identify the content files you need to update. These include tsx files that control page text, navigation, and settings.
3. Edit the relevant file(s):
   - Update titles, descriptions, labels, and other content fields.
   - Save the file after making changes.
4. Refresh the local site in your browser to see the updates.

---

# FAQ

## Update Hero section Content:

## 1. How to Update Hero Section Content

The Hero Section slider content is managed through the `Pages` array configuration.

### File Location

```bash
/config/slider.ts
```

---

## Structure of a Hero Slide

Each object inside the `Pages` array represents one slide in the Hero section.

Example:

```ts
{
  title: "Symbolic Intelligence Platform",
  highlight: "Intelligence",
  desc: "Symbolic intelligence infrastructure for financial modeling, computational biology, quantum computing, and more.",
  tagline: "For Understanding and Controlling Complex Systems",
  image: BaseURL + "lightBg.mp4",
  isDark: false,
  cta: "Get In Touch",
  ctaLink: "/contact",
  secondaryCta: "Read Research",
  secondaryCtaLink: "/research",
}
```

---

# Field Explanation

| Field              | Description                                    |
| ------------------ | ---------------------------------------------- |
| `title`            | Main heading displayed in the Hero section     |
| `highlight`        | Highlighted text with special styling          |
| `desc`             | Description text below the title               |
| `tagline`          | Small tagline shown above or below the content |
| `image`            | Background image or video path                 |
| `isDark`           | Enables dark overlay/content styling           |
| `cta`              | Primary button text                            |
| `ctaLink`          | Primary button redirect link                   |
| `secondaryCta`     | Secondary button text                          |
| `secondaryCtaLink` | Secondary button redirect link                 |

---

# Adding a New Hero Slide

Add a new object inside the `Pages` array.

Example:

```ts
{
  title: "Next Generation Quantum Systems",
  highlight: "Quantum Systems",
  desc: "Research-driven infrastructure for scalable and intelligent quantum computing solutions.",
  tagline: "Building Tomorrow's Computational Architecture",
  image: "/slider/quantum.mp4",
  isDark: true,
  cta: "Learn More",
  ctaLink: "/about",
  secondaryCta: "View Research",
  secondaryCtaLink: "/research",
}
```

---

# Using Local Media Files

Store images/videos inside:

```bash
/public/slider/
```

Example:

```ts
image: "/slider/video.mp4"
```

---

# Dark vs Light Slides

### Light Slide

```ts
isDark: false
```

Used when the background is already light.

### Dark Slide

```ts
isDark: true
```

Used for dark backgrounds to improve text readability.

---

# Recommended Media Sizes

| Type  | Recommendation         |
| ----- | ---------------------- |
| Video | 1920×1080 MP4          |
| Image | 1920×1080 JPG/PNG/WebP |

---

# Best Practices

* Keep titles short and impactful
* Use high-quality media assets
* Avoid overly long descriptions
* Prefer optimized `.webp` images when possible
* Compress videos before upload for better performance

---

# Example Full Configuration

```ts
const BaseURL = "/slider/";

export const Pages = [
  {
    title: "Symbolic Intelligence Platform",
    highlight: "Intelligence",
    desc: "Symbolic intelligence infrastructure for financial modeling, computational biology, quantum computing, and more.",
    tagline: "For Understanding and Controlling Complex Systems",
    image: BaseURL + "lightBg.mp4",
    isDark: false,
    cta: "Get In Touch",
    ctaLink: "/contact",
    secondaryCta: "Read Research",
    secondaryCtaLink: "/research",
  },
];
```
---
# How to Update Research & Papers Section

## Overview

The Research & Papers section displays technical reports, whitepapers, benchmark reports, and research publications on the website.

All research entries are managed through a centralized configuration array.
---

# File Location

```bash
/config/researchAndPaper.ts
```
---

# Import Structure

```ts
import { ResearchAndPaperProps } from "../research/Research";
```
---

# Configuration Structure
The section uses an array called `researchAndPaper`.
Each object inside the array represents a single research paper card displayed on the website.

---

# Example Configuration

```ts
import { ResearchAndPaperProps } from "../research/Research";

export const researchAndPaper: ResearchAndPaperProps[] = [
  {
    title: "A symbolic braid-inspired topological intelligence engine",
    version: "v4.0",
    tag: "FoldShield++",
    desc: "Most structural comparison tools share a fundamental blind spot: they operate purely on coordinate geometry.",
    documentation: "research/FoldShield OnePager v4 04302026.pdf"
  },
];
```

---

# Field Definitions

| Field           | Type     | Required | Description                       |
| --------------- | -------- | -------- | --------------------------------- |
| `title`         | `string` | Yes      | Main title of the research paper  |
| `version`       | `string` | No       | Research/version identifier       |
| `tag`           | `string` | Yes      | Short label displayed on the card |
| `desc`          | `string` | Yes      | Brief summary or description      |
| `documentation` | `string` | Yes      | Relative path to the PDF/document |

---

# Adding a New Research Paper

Add a new object inside the `researchAndPaper` array.

Example:

```ts
{
  title: "Quantum Structural Reasoning Framework",
  version: "v1.2",
  tag: "QSRF",
  desc: "A symbolic reasoning framework for scalable quantum optimization and computational intelligence.",
  documentation: "research/QSRF Whitepaper.pdf"
}
```

---

# PDF Storage Location

All PDF files should be placed inside:

```bash
/public/research/
```

Example:

```bash
/public/research/QSRF Whitepaper.pdf
```

---

# Documentation Path Rules

The `documentation` field uses paths relative to the `public` directory.

Correct:

```ts
documentation: "research/MyPaper.pdf"
```

Incorrect:

```ts
documentation: "/public/research/MyPaper.pdf"
```

# Troubleshooting

## PDF Not Opening

Check:

* File exists inside `/public/research/`
* File name matches exactly
* Spaces/capitalization are correct

---
# Example Final Structure

```bash
/public
  /research
    FoldShield OnePager v4 04302026.pdf
    RexCrux OmegaSignal OnePager.pdf
    RexCrux QPhase 1 Page BenchMark Report 04222026.pdf

/config
  researchAndPaper.ts
```

## Notes

- If the project make major change, do build before pushing: `npm run build`.