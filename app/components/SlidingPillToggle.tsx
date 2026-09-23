"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Sun, Monitor, Moon } from "lucide-react";

export type Theme = "light" | "system" | "dark";

const OPTIONS = [
  {
    value: "light" as Theme,
    icon: Sun,
    neon: {
      glow: "rgba(250,204,21,0.8)",
      bg: "rgba(250,204,21,0.10)",
      border: "rgba(250,204,21,0.35)",
      shadow: "rgba(250,204,21,0.25)",
      text: "#facc15",
    },
  },
  {
    value: "system" as Theme,
    icon: Monitor,
    neon: {
      glow: "rgba(34,211,238,0.8)",
      bg: "rgba(34,211,238,0.10)",
      border: "rgba(34,211,238,0.35)",
      shadow: "rgba(34,211,238,0.25)",
      text: "#22d3ee",
    },
  },
  {
    value: "dark" as Theme,
    icon: Moon,
    neon: {
      glow: "rgba(255,255,255,0.8)",
      bg: "rgba(255,255,255,0.08)",
      border: "rgba(255,255,255,0.25)",
      shadow: "rgba(255,255,255,0.15)",
      text: "#ffffff",
    },
  },
] as const;

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.setAttribute("data-theme", resolved);
}

const SlidingPillToggle = () => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [gliderStyle, setGliderStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme;
    const initial = saved ?? "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme, mounted]);

  useLayoutEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    if (!container) return;

    const idx = OPTIONS.findIndex((o) => o.value === theme);
    const buttons = container.querySelectorAll<HTMLButtonElement>("button");
    const btn = buttons[idx];
    if (!btn) return;

    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();

    setGliderStyle({
      width: bRect.width,
      transform: `translateX(${bRect.left - cRect.left - 4}px)`,
    });
  }, [theme, mounted]);

  if (!mounted) return null;

  const activeNeon = OPTIONS.find((o) => o.value === theme)!.neon;

  const handleThemeChange = (e: React.MouseEvent<HTMLButtonElement>, newTheme: Theme) => {
    e.preventDefault();
    if (newTheme === theme) return;
    setTheme(newTheme);
  }

  return (
    <div
      ref={containerRef}
      className="relative hidden w-fit items-center gap-0.5 rounded-md p-1"
    >
      <div
        className="absolute top-1 left-1 rounded-md"
        style={{
          background: activeNeon.bg,
          border: `1px solid ${activeNeon.border}`,
          boxShadow: `0 0 12px ${activeNeon.shadow}`,
          transition:
            "transform 0.26s cubic-bezier(.4,0,.2,1), width 0.26s cubic-bezier(.4,0,.2,1), background 0.26s, border-color 0.26s, box-shadow 0.26s",
          pointerEvents: "none",
          ...gliderStyle,
        }}
      />

      {OPTIONS.map(({ value, icon: Icon, neon }) => {
        const active = theme === value;

        return (
          <button
            key={value}
            onClick={(e) => handleThemeChange(e, value)}

            className="relative z-10 flex size-6 items-center justify-center rounded-md bg-transparent outline-none"
            style={{
              color: active ? neon.text : "#444444",
              filter: active
                ? `drop-shadow(0 0 6px ${neon.glow})`
                : "none",
              cursor: active ? "default" : "pointer",
            }}
          >
            <Icon size={14} strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
};

export default SlidingPillToggle;