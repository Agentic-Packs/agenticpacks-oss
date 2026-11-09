"use client";

import { motion, type Easing, type Transition } from "motion/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type Snapshot = Record<string, string | number>;

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Snapshot;
  animationTo?: Snapshot[];
  easing?: Easing | Easing[];
  onAnimationComplete?: () => void;
  stepDuration?: number;
};

const buildKeyframes = (from: Snapshot, steps: Snapshot[]): Record<string, Array<string | number>> => {
  const keys = new Set<string>([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))]);
  const keyframes: Record<string, Array<string | number>> = {};
  keys.forEach((key) => {
    keyframes[key] = [from[key], ...steps.map((step) => step[key])];
  });
  return keyframes;
};

export default function BlurText({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (t: number) => t,
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!ref.current || reduced) return;
    const node = ref.current;
    let observer: IntersectionObserver | undefined;

    const visibleNow = () => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
    };

    const frame = requestAnimationFrame(() => {
      if (visibleNow()) {
        setInView(true);
        return;
      }
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer?.disconnect();
          }
        },
        { threshold, rootMargin },
      );
      observer.observe(node);
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [threshold, rootMargin, reduced]);

  const defaultFrom = useMemo(
    () =>
      direction === "top"
        ? { filter: "blur(8px)", opacity: 0, y: -12 }
        : { filter: "blur(8px)", opacity: 0, y: 12 },
    [direction],
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: "blur(4px)",
        opacity: 0.5,
        y: direction === "top" ? 4 : -4,
      },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction],
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;
  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => (stepCount === 1 ? 0 : i / (stepCount - 1)));

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
        const spanTransition: Transition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000,
          ease: easing,
        };

        return (
          <motion.span
            key={`${segment}-${index}`}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
            style={{ display: "inline-block", willChange: "transform, filter, opacity" } as CSSProperties}
          >
            {segment === " " ? "\u00A0" : segment}
            {animateBy === "words" && index < elements.length - 1 ? "\u00A0" : null}
          </motion.span>
        );
      })}
    </span>
  );
}
