"use client";
import React, { useState } from "react";

export const Spoiler = ({ children }: { children: React.ReactNode }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <span
      role="button"
      tabIndex={revealed ? -1 : 0}
      onClick={() => setRevealed(true)}
      onKeyDown={(e) => {
        if (!revealed && (e.key === "Enter" || e.key === " ")) setRevealed(true);
      }}
      title={revealed ? undefined : "Click to reveal"}
      className={
        revealed
          ? "inline"
          : "cursor-pointer rounded px-1 bg-zinc-900 dark:bg-zinc-100 text-transparent select-none hover:opacity-80 transition-opacity"
      }
    >
      {children}
    </span>
  );
};
