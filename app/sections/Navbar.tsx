/* eslint-disable @next/next/no-img-element */
"use client";
import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { usePathname } from "next/navigation";
import BrandLogo from "../components/BrandLogo";
import SlidingPillToggle from "../components/SlidingPillToggle";

const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mobileRef = useRef<HTMLDivElement | null>(null);
  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!mobileRef.current) return;

    const el = mobileRef.current;

    if (mobileOpen) {
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        {
          height: "auto",
          opacity: 1,
          duration: 0.3,
          ease: "power3.out",
        },
      );
    } else {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      });
    }

  }, [mobileOpen]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  // entry animation — the navbar only ever mounts once Loading has already
  // docked its logo, so this slide-down+fade is what the person actually
  // sees appear right after that; keep it in sync with Loading's ~0.5s fade
  useEffect(() => {
    if (!navContainerRef.current) return;

    gsap.fromTo(
      navContainerRef.current,
      { y: -24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out"},
    );
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setMobileOpen(false);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!mobileOpen) return;
      if (!navContainerRef.current) return;

      if (!navContainerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const moveIndicator = (el: HTMLDivElement | null) => {
    if (!el || !indicatorRef.current) return;

    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement!.getBoundingClientRect();

    gsap.to(indicatorRef.current, {
      x: rect.left - parentRect.left,
      width: rect.width - 6,
      opacity: 1,
      duration: 0.3,
      ease: "power3.out",
    });
  };

  useEffect(() => {
    if (!indicatorRef.current) return;

    if (pathname === "/") {
      gsap.to(indicatorRef.current, {
        width: 0,
        opacity: 0,
        duration: 0.2,
      });
      return;
    }

    const el = itemRefs.current[pathname];
    moveIndicator(el);
  }, [pathname]);

  return (<>
    <div className=" fixed top-1 md:left-19 left-2 z-50 ">
      <BrandLogo />
    </div>
    <nav
      ref={navContainerRef}
      className="fixed w-full backdrop-blur-xl bg-white/20 dark:bg-black/20 flex justify-end items-center inset-x-0 top-0 z-40 p-3 px-5 md:px-10 lg:px-20"
    >
      <SlidingPillToggle />
    </nav>
  </>
  );
};

export default Navbar;