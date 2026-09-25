"use client";

import type { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import { motion } from "framer-motion";

export type Solution = {
  title: string;
  desc: string;
  images?: (string | StaticImport)[];
};

const HorizontalEntity = ({
  title,
  desc,
  images = [],
  index,
}: Solution & { index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.06,
      }}
      data-cursor="read"
      className="group relative flex items-center justify-between gap-8 py-8"
    >
      {/* side indicator */}
      <span
        aria-hidden
        className="absolute -left-6 top-1/2 h-[60%] w-px origin-center -translate-y-1/2 scale-y-0 bg-black transition-transform duration-300 ease-out group-hover:scale-y-100 dark:bg-white"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-6">
          <h3 className="text-md font-medium tracking-tight text-black/60 transition-colors duration-300 group-hover:text-black dark:text-white/60 dark:group-hover:text-white md:text-md lg:text-xl">
            {title}
          </h3>

          {/* index badge */}
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/20 text-xs text-black/50 transition-colors duration-300 group-hover:border-black/60 group-hover:text-black dark:border-white/20 dark:text-white/50 dark:group-hover:border-white/60 dark:group-hover:text-white">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <p className="max-w-xl text-xs leading-relaxed text-black/50 transition-colors duration-300 group-hover:text-black/70 dark:text-white/50 dark:group-hover:text-white/70 md:text-sm">
          {desc}
        </p>
      </div>

      {images.length > 0 && (
        <div className="hidden shrink-0 items-center gap-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
          {images.map((src, i) => (
            <div
              key={i}
              className="relative shrink-0 overflow-hidden rounded-xl bg-black/5 dark:bg-white/5"
              style={{
                width: i === 1 ? 120 : 96,
                height: i === 1 ? 80 : 68,
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="120px"
                unoptimized
              />

              <div className="absolute inset-0 rounded-xl border border-black/10 dark:border-white/10" />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default HorizontalEntity;