import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface CountUpProps {
  value: string; // e.g. "5+", "100%", "50+"
  duration?: number;
  className?: string;
}

/**
 * Counts up to a numeric target when scrolled into view, preserving any
 * trailing suffix (e.g. "+", "%"). Falls back to the raw string if the
 * value doesn't start with a number.
 */
const CountUp = ({ value, duration = 1400, className }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(value.trim());
  const target = match ? parseFloat(match[1]) : NaN;
  const suffix = match ? match[2] : "";

  const [display, setDisplay] = useState(Number.isNaN(target) ? value : "0");
  // Fallback so the number never stays at 0 if the viewport observer is slow
  // to fire (or never does, e.g. under prefers-reduced-motion / headless).
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setFallback(true), 1600);
    return () => clearTimeout(id);
  }, []);

  const active = inView || fallback;

  useEffect(() => {
    if (!active || Number.isNaN(target)) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(String(target) + suffix);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(target * eased).toString() + suffix);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
};

export default CountUp;
