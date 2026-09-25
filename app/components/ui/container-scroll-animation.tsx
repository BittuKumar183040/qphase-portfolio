"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "motion/react";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const width = useTransform(scrollYProgress, [0, 0.5], ["70vw", "100vw"]);
  const radius = useTransform(scrollYProgress, [0, 0.5], [28, 0]);
  const translate = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  return (
    // extra height = the runway the sticky child scrolls through before it releases
    <div ref={containerRef} className="relative" style={{ height: "100vh" }}>
      {/* NOTE: no overflow-hidden and no perspective here — that's what was locking scroll */}
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center">
        <Header translate={translate} titleComponent={titleComponent} />
        <Card width={width} radius={radius}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => (
  <motion.div
    style={{ translateY: translate }}
    className="mx-auto mb-8 max-w-5xl text-center"
  >
    {titleComponent}
  </motion.div>
);

export const Card = ({
  width,
  radius,
  children,
}: {
  width: MotionValue<string>;
  radius: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    // the "window" — this is the only element that resizes
    <motion.div
      style={{
        width,
        borderRadius: radius,
        transformPerspective: 1200,
      }}
      className="relative origin-top overflow-hidden bg-black dark:bg-white"
    >
      <div className="relative w-full h-dvh -mb-20">
        <div className="absolute left-1/2 top-0 h-full w-screen max-w-none -translate-x-1/2">
          {children}
        </div>
      </div>
    </motion.div>
  );
};
