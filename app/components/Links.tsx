"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const HorizontalScale = ({
  className = "",
}: {
  className?: string;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const groups = [
    [
      { label: "Products", href: "/#products" },
      { label: "Research", href: "/research#research-papers" },
    ],
    [
      { label: "Platform", href: "/about#platform" },
      { label: "Solutions", href: "/#solutions" },
    ],
    [
      { label: "About", href: "/about" },
      { label: "Team", href: "/about#team" },
      { label: "Careers", href: "/about#careers" },
      { label: "Get In Touch", href: "/contact#get-in-touch" },
    ],
  ];

  let globalIdx = 0;

  const linkStyle = (i: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 0.45s ease ${i * 0.06}s, transform 0.45s ease ${i * 0.06}s`,
  });

  return (
    <div className={`relative w-full ${className}`}>
      <footer className="relative z-10">
        <div className="flex flex-col items-start">

          {groups.map((group, gi) => (
            <div key={gi} className="flex flex-col items-start w-full">
              {gi > 0 && (
                <div className="w-8 h-px bg-gray-300 dark:bg-gray-600 opacity-50 my-1.5" />
              )}
              {group.map((link) => {
                const idx = globalIdx++;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    style={linkStyle(idx)}
                    className="
                      relative py-2 font-bold text-[15px] tracking-wide
                      text-gray-600 dark:text-gray-400
                      hover:text-[#D89267] dark:hover:text-[#D89267]
                      hover:translate-x-1.5 transition-all duration-200
                      after:absolute after:bottom-1.5 after:left-0
                      after:h-px after:w-full after:bg-current
                      after:scale-x-0 after:origin-left
                      after:transition-transform after:duration-250
                      hover:after:scale-x-100
                    "
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};