"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

type Phase = "loading" | "docking" | "dissolving" | "done";

const Loading = ({ children }: { children?: React.ReactNode }) => {
  const [phase, setPhase] = useState<Phase>("loading");

  // page finished loading -> start the logo's move to its resting spot
  useEffect(() => {
    if (document.readyState === "complete") {
      requestAnimationFrame(() => setPhase("docking"));
      return;
    }

    const handleLoad = () => {
      requestAnimationFrame(() => setPhase("docking"));
    };

    window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  const isLoading = phase === "loading";
  const isDocking = phase === "docking";
  const showOverlay = phase !== "done";
  // the real app doesn't mount at all until the logo has finished docking —
  // Navbar/Hero/etc. don't exist in the DOM before this flips true
  const showContent = phase === "dissolving" || phase === "done";

  return (
    <>
      {showOverlay && (
        <div
          className={`fixed inset-0 z-[9999] ${
            isLoading ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* backdrop: solid while loading, dissolves once the logo starts docking */}
          <motion.div
            className="absolute inset-0 bg-white dark:bg-black"
            animate={{ opacity: isLoading ? 1 : 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* centered wrapper only while loading; logo itself moves independently */}
          <div
            className={
              isLoading
                ? "flex h-full w-full items-center justify-center"
                : "contents"
            }
          >
            <motion.div
              layout
              className={
                isLoading ? "relative size-18" : "absolute left-0 top-0 size-12"
              }
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              onLayoutAnimationComplete={() => {
                if (isDocking) setPhase("dissolving");
              }}
              animate={{ opacity: phase === "dissolving" ? 0 : 1 }}
              onAnimationComplete={() => {
                if (phase === "dissolving") setPhase("done");
              }}
            >
              <Image
                src="asset/Logo.svg"
                alt="logo"
                width={48}
                height={48}
                className="h-full w-full rounded-full"
              />

              <AnimatePresence>
                {isLoading && (
                  <>
                    <motion.span
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 rounded-full border border-white/10"
                    />
                    <motion.span
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 animate-spin rounded-full border-t border-[#f3d400]"
                    />
                    <motion.span
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-3 rounded-full border border-white/5"
                    />
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      )}

      {/* app content mounts for the first time here, right as the logo docks —
          opacity-only fade so it never touches Navbar's `fixed` positioning
          (a transformed ancestor would break that; opacity alone doesn't) */}
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
        >
          {children}
        </motion.div>
      )}
    </>
  );
};

export default Loading;