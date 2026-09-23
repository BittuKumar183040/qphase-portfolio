"use client";

import { ReactNode, useRef, useState } from "react";
import { gsap } from "gsap";

interface MediaRevealProps {
  children: ReactNode;
  src?: string;
  type?: "image" | "video";
  width?: number;
  height?: number;
  className?: string;
}

export default function MediaReveal({
  children,
  src,
  type = "image",
  width = 260,
  height = 320,
  className = "",
}: MediaRevealProps) {
  const mediaRef = useRef<HTMLDivElement>(null);

  const [isActive, setIsActive] = useState(false);

  const show = (e: React.MouseEvent) => {
    setIsActive(true);

    gsap.killTweensOf(mediaRef.current);

    gsap.to(mediaRef.current, {
      x: e.clientX,
      y: e.clientY - height / 2,
      opacity: 1,
      scale: 1,
      duration: 0.25,
      ease: "power3.out",
    });
  };

  const hide = () => {
    gsap.killTweensOf(mediaRef.current);

    gsap.to(mediaRef.current, {
      opacity: 0,
      scale: 0.7,
      duration: 0.2,
      ease: "power3.out",
    });
  };

  const move = (e: React.MouseEvent) => {
    gsap.to(mediaRef.current, {
      x: e.clientX + 30,
      y: e.clientY - height / 2,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  return (
    <>
      <div className={className} onMouseEnter={show} onMouseLeave={hide} onMouseMove={move} >
        {children}
      </div>

      <div
        ref={mediaRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] overflow-hidden rounded-2xl opacity-0 scale-75 shadow-2xl will-change-transform"
        style={{ width: src && width, height: src && height }}
      >
        {isActive && src &&
          (type === "image" ? (
            <img src={src} loading="lazy" decoding="async" className="h-full w-full object-cover" draggable={false} />
          ) : (
            <video src={src} autoPlay muted loop playsInline preload="none" className="h-full w-full object-cover" />
          ))}
      </div>
    </>
  );
}