"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const Loading = ({ children }: { children?: React.ReactNode }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (document.readyState === "complete") {
      requestAnimationFrame(() => setLoaded(true));
      return;
    }

    const handleLoad = () => {
      requestAnimationFrame(() => setLoaded(true));
    };

    window.addEventListener("load", handleLoad);

    return () => window.removeEventListener("load", handleLoad);
  }, []);

  return (
    <>
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f0f10] transition-opacity duration-500 ${
          loaded
            ? "pointer-events-none opacity-0"
            : "pointer-events-auto opacity-100"
        }`}
      >
        <div className="flex flex-col items-center gap-8">
          <div className="relative h-20 w-20">
            <Image
              src="asset/Logo.svg"
              alt="logo"
              width={48}
              height={48}
              className="rounded-full h-full w-full"
            />
            <span className="absolute inset-0 rounded-full border border-white/10" />
            <span className="absolute inset-0 rounded-full border-t border-[#f3d400] animate-spin" />
            <span className="absolute inset-3 rounded-full border border-white/5" />
          </div>
        </div>
      </div>

      {children}
    </>
  );
};

export default Loading;
