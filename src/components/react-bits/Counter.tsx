"use client";

import { useEffect, useRef, useState } from "react";

type CounterProps = {
  value: number;
  className?: string;
};

export default function Counter({ value, className = "" }: CounterProps) {
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || played.current) {
      setShown(value);
      return;
    }

    const node = ref.current;
    if (!node) {
      setShown(value);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || played.current) return;
        played.current = true;
        observer.disconnect();
        const start = performance.now();
        const duration = 700;
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setShown(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {shown.toLocaleString()}
    </span>
  );
}
