'use client';

import { useState } from "react";

type MenuProps = {
  label: string;
  href?: string;
  register?: (el: HTMLDivElement | null, href?: string) => void;
  onHover?: (el: HTMLDivElement) => void;
};

export default function Menu({
  label,
  href = "",
  register,
  onHover,
}: MenuProps) {
  const [active, setActive] = useState(false);

  const scrollToSection = () => {
    const section = document.getElementById(href);

    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div
      ref={(el) => register?.(el, href)}
      onMouseEnter={(e) => onHover?.(e.currentTarget)}
      onClick={scrollToSection}
      className="relative"
    >
      <button
        className={`
          flex items-center font-medium px-4 text-sm transition
          ${
            active
              ? "text-black dark:text-white"
              : "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
          }
        `}
      >
        {label}
      </button>
    </div>
  );
}