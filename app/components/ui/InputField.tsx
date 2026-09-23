import { ResolvedItem } from "@/app/sections/CoreSection";
import {
  motion,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  MotionValue,
} from "framer-motion";
import { useRef } from "react";

const ROTATE_RANGE = 10; // deg, max tilt on either axis
const PRESS_SCALE = 1.1; // how much the card shrinks as it "pushes in"
const PRESS_DEPTH = -1; // px, how far it recedes on the z-axis
const SPRING = { stiffness: 300, damping: 22, mass: 0.01 };

const InputField = ({
  item,
  index,
  scrollYProgress,
}: {
  item: ResolvedItem;
  index: number;
  scrollYProgress: MotionValue<number>;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const start = Math.min(0.1 * index, 0.4);
  const end = Math.min(start + 0.55, 1);

  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const scrollScale = useTransform(
    scrollYProgress,
    [start, end],
    [item.motionScale, 1],
  );
  const x = useTransform(scrollYProgress, [start, end], [item.motionX, 0]);
  const y = useTransform(scrollYProgress, [start, end], [item.motionY, 0]);
  const entranceRotate = useTransform(
    scrollYProgress,
    [start, end],
    [item.motionRotate, 0],
  );

  const borderColor = useTransform(
    scrollYProgress,
    [start, end],
    ["rgba(148,148,148,0.45)", "rgba(255,255,255,0.2)"],
  );

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const hoverProgress = useMotionValue(0);

  const springX = useSpring(pointerX, SPRING);
  const springY = useSpring(pointerY, SPRING);
  const springHover = useSpring(hoverProgress, SPRING);

  const rotateX = useTransform(springY, [-0.5, 0.5], [ROTATE_RANGE, -ROTATE_RANGE]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-ROTATE_RANGE, ROTATE_RANGE]);
  const z = useTransform(springHover, [0, 1], [0, PRESS_DEPTH]);
  const pressScale = useTransform(springHover, [0, 1], [1, PRESS_SCALE]);

  const combinedScale = useTransform(
    [scrollScale, pressScale],
    ([s, p]) => (s as number) * (p as number),
  );

  const sheenX = useTransform(springX, [-0.5, 0.5], [0, 100]);
  const sheenY = useTransform(springY, [-0.5, 0.5], [0, 100]);
  const sheenBackground = useMotionTemplate`radial-gradient(180px circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.35), transparent 70%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerEnter = () => hoverProgress.set(1);
  const handlePointerLeave = () => {
    hoverProgress.set(0);
    pointerX.set(0);
    pointerY.set(0);
  };

  const isLeft = item.side === "left";

  return (
    <motion.div
      style={{ opacity, scale: combinedScale, x, y, rotate: entranceRotate, perspective: 800, width: `${item.width}px`  }}
      className={`flex items-center gap-2.5 ${isLeft ? "" : "flex-row-reverse"} ${item.className ?? ""}`}
    >
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={{ borderColor, rotateX, rotateY, z, transformStyle: "preserve-3d" }}
        className="group relative min-w-0 flex-1 rounded-lg border bg-neutral-900/80 px-4 py-2.5 shadow-none backdrop-blur-sm transition-shadow duration-300 hover:shadow-[inset_0_2px_10px_rgba(255,255,255,0.12),0_1px_2px_rgba(255,255,255,0.04)] dark:bg-white/90 dark:shadow-sm dark:shadow-neutral-900/5 dark:hover:shadow-[inset_0_2px_10px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.04)] sm:px-4 sm:py-3"
      >
        {/* cursor-following sheen — purely decorative, sits above the content */}
        <motion.div
          aria-hidden
          style={{ background: sheenBackground, opacity: springHover }}
          className="pointer-events-none absolute inset-0 rounded-lg mix-blend-soft-light dark:mix-blend-overlay"
        />

        {item.label && (
          <div className="flex items-center gap-1.5">
            <p className="m-0 font-medium tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
              {item.label}
            </p>
          </div>
        )}
        <p className="m-0 mt-1 font-sans text-sm font-medium leading-snug text-neutral-100 dark:text-neutral-800 sm:text-[0.95rem]">
          {item.title}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default InputField;