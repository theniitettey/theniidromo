"use client";
import React, { useState } from "react";

export const Spoiler = ({ children }: { children: React.ReactNode }) => {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return <span className="inline">{children}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      title="Click to reveal"
      className="cursor-pointer rounded px-1 bg-zinc-900 dark:bg-zinc-100 text-transparent select-none hover:opacity-80 transition-opacity"
    >
      {children}
    </button>
  );
};
