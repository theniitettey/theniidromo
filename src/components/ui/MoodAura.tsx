"use client";

import { motion } from "framer-motion";

export interface VibeProps {
  energy: number;
  groove: number;
  happiness: number;
  color: string;
  compact?: boolean;
}

export const MoodAura = ({ energy, groove, happiness, color, compact = false }: VibeProps) => {
  const eSpeed = 6 - (energy / 100) * 3.5;
  const eAmt   = 8 + (energy / 100) * 16;
  const gR     = 12 + (groove / 100) * 20;
  const gSpeed = 9 - (groove / 100) * 5;
  const hScale = 1 + (happiness / 100) * 0.4;
  const hSpeed = 5 - (happiness / 100) * 2.5;

  const colorTransition = { duration: 1.2, ease: "easeOut" as const };

  if (compact) {
    // Horizontal pill layout — small orbs, vertically centered, higher opacity
    const cAmt = 4 + (energy / 100) * 8;
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-0">
        {/* Left orb — energy */}
        <motion.div
          className="absolute -left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full blur-lg"
          animate={{
            backgroundColor: color,
            x: [0, -cAmt * 0.5, cAmt * 0.8, -cAmt * 0.3, 0],
            opacity: [0.5, 0.6, 0.45, 0.55, 0.5],
          }}
          transition={{
            backgroundColor: colorTransition,
            x: { duration: eSpeed, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: eSpeed * 0.9, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        {/* Center orb — happiness */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-xl"
          animate={{
            backgroundColor: color,
            scale: [1, hScale * 0.6 + 0.4, 0.92, 1],
            opacity: [0.35, 0.45, 0.28, 0.35],
          }}
          transition={{
            backgroundColor: colorTransition,
            scale:   { duration: hSpeed, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: hSpeed * 1.2, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        {/* Right orb — groove */}
        <motion.div
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full blur-lg"
          animate={{
            backgroundColor: color,
            x: [gR * 0.15, -gR * 0.15, gR * 0.1, -gR * 0.1, gR * 0.15],
            opacity: [0.42, 0.52, 0.38, 0.48, 0.42],
          }}
          transition={{
            backgroundColor: colorTransition,
            x: { duration: gSpeed, repeat: Infinity, ease: "linear" },
            opacity: { duration: gSpeed, repeat: Infinity, ease: "linear" },
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-0">
      <motion.div
        className="absolute left-[8%] top-[10%] w-28 h-28 rounded-full blur-xl"
        animate={{
          backgroundColor: color,
          x: [0, -eAmt * 0.6, eAmt, eAmt * 0.4, -eAmt * 0.3, 0],
          y: [0, eAmt * 0.8, eAmt * 0.3, -eAmt * 0.7, -eAmt * 0.2, 0],
          opacity: [0.3, 0.38, 0.28, 0.36, 0.3, 0.3],
        }}
        transition={{
          backgroundColor: colorTransition,
          x: { duration: eSpeed, repeat: Infinity, ease: "easeInOut" },
          y: { duration: eSpeed * 1.1, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: eSpeed * 0.9, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      <motion.div
        className="absolute right-[8%] bottom-[5%] w-24 h-24 rounded-full blur-xl"
        animate={{
          backgroundColor: color,
          x: [gR, gR * 0.3, -gR * 0.7, -gR, -gR * 0.3, gR * 0.7, gR],
          y: [0, -gR * 0.8, -gR * 0.5, 0, gR * 0.8, gR * 0.5, 0],
          opacity: [0.22, 0.28, 0.22, 0.26, 0.22, 0.28, 0.22],
        }}
        transition={{
          backgroundColor: colorTransition,
          x: { duration: gSpeed, repeat: Infinity, ease: "linear" },
          y: { duration: gSpeed, repeat: Infinity, ease: "linear" },
          opacity: { duration: gSpeed, repeat: Infinity, ease: "linear" },
        }}
      />
      <motion.div
        className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full blur-2xl"
        animate={{
          backgroundColor: color,
          scale: [1, hScale, 0.95, hScale * 0.85, 1],
          opacity: [0.16, 0.22, 0.14, 0.20, 0.16],
        }}
        transition={{
          backgroundColor: colorTransition,
          scale:   { duration: hSpeed, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: hSpeed * 1.2, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </div>
  );
};
