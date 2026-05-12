"use client";
import React from "react";
import Link from "next/link";
import { FiGithub } from "react-icons/fi";
import { Dancing_Script } from "next/font/google";

const cursive = Dancing_Script({
  weight: ["600"],
  subsets: ["latin"],
  display: "swap",
});

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex justify-between items-center py-5 text-xs text-zinc-400 dark:text-zinc-500">
        <div className="flex items-center gap-2">
          <Link href="/" className={`${cursive.className} text-sm hover:opacity-80 transition-opacity text-foreground`}>
            The Nii Dromo
          </Link>
          <span>· {year}</span>
        </div>
        <Link
          href="https://github.com/michaelperryjnr/themefolio"
          target="_blank"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <FiGithub size={12} />
          <span className="hidden sm:inline">source</span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
