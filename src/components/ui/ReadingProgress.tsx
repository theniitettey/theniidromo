"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";

const READING_PATHS = [/^\/posts\/.+/, /^\/thoughts\/.+/, /^\/asore\/.+/];

export function ReadingProgress() {
  const pathname = usePathname();
  const raw = useMotionValue(0);
  const scaleX = useSpring(raw, { stiffness: 200, damping: 40 });

  const isReadingPage = READING_PATHS.some((p) => p.test(pathname));

  useEffect(() => {
    raw.set(0);
    if (!isReadingPage) return;

    const update = () => {
      const doc = document.documentElement;
      const scrolled = window.scrollY || doc.scrollTop;
      const total = doc.scrollHeight - doc.clientHeight;
      raw.set(total > 0 ? scrolled / total : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname, isReadingPage, raw]);

  if (!isReadingPage) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-[#1DB954] origin-left z-[100]"
      style={{ scaleX }}
    />
  );
}
