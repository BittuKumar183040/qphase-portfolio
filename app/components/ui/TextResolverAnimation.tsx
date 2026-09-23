"use client";

import { useEffect, useRef, useState } from "react";

interface TextResolverProps {
  strings: string[];
  className?: string;
  interval?: number;
  iterations?: number;
  timeout?: number;
}

const CHARACTERS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&-+_?/\\=";

export default function TextResolver({
  strings,
  className = "",
  interval = 1000,
  iterations = 10,
  timeout = 25,
}: TextResolverProps) {
  const [text, setText] = useState("");

  const currentIndex = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const randomChar = () =>
      CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];

    const animate = async () => {
      while (mounted.current) {
        const target = strings[currentIndex.current];

        for (let offset = 0; offset <= target.length; offset++) {
          const partial = target.slice(0, offset);

          for (let i = iterations; i >= 0; i--) {
            if (!mounted.current) return;

            if (i === 0) {
              setText(partial);
            } else {
              setText(
                partial.slice(0, -1) +
                  randomChar()
              );
            }

            await sleep(timeout);
          }
        }

        await sleep(interval);

        currentIndex.current =
          (currentIndex.current + 1) % strings.length;
      }
    };

    animate();

    return () => {
      mounted.current = false;
    };
  }, [strings, interval, iterations, timeout]);

  return (
    <div className={className}>
      {text}
    </div>
  );
}