"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import romans from "romans";
import { person } from "@/data/person";
import { FiGithub } from "react-icons/fi";
import { Dancing_Script } from "next/font/google";

const cursive = Dancing_Script({
  weight: ["600"],
  subsets: ["latin"],
  display: "swap",
});

const Footer = () => {
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setYear(romans.romanize(currentYear).toLowerCase());
  }, []);

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex justify-between items-center py-5 text-xs text-zinc-400 dark:text-zinc-500">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className={`${cursive.className} text-sm hover:opacity-80 transition-opacity text-foreground`}
          >
            the nii dromo
          </Link>
        </div>
        <div className="flex justify-center items-center gap-1.5">
          <Link
            href={person.projects.themefolio}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <FiGithub size={12} />
          </Link>
          <span>·</span>
          <span className="text-foreground sm:inline cursor-none">{year}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
