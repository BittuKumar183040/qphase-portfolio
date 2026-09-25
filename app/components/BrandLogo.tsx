"use client";

import Image from "next/image";
import Link from "next/link";
import { hero } from "../config/content";

const BrandLogo = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={scrollToTop}
        className="flex items-center gap-2 cursor-pointer"
        aria-label="Go to top"
      >
        <div className="shrink-0">
          <Image
            src="/asset/Logo.svg"
            width={48}
            height={48}
            alt="QPhase"
            unoptimized
          />
        </div>

        <p className="text-xs md:text-xl">{hero.eyebrow.qphase}</p>
      </button>

      <span className="text-black/40 dark:text-white/40">×</span>

      <Link
        href="https://rexcrux.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs transition-colors hover:text-[#8C4A2A] md:text-xl"
      >
        {hero.eyebrow.rexcrux}
      </Link>
    </div>
  );
};

export default BrandLogo;