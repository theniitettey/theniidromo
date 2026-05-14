"use client";

import { useEffect, useMotionValue, useSpring } from "framer-motion";
import { motion } from "framer-motion";

export function ReadingProgress() {
  const raw = useMotionValue(0);
  const scaleX = useSpring(raw, { stiffness: 200, damping: 40 });

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      raw.set(total > 0 ? scrolled / total : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [raw]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-[#1DB954] origin-left z-50"
      style={{ scaleX }}
    />
  );
}
