"use client";
import React from "react";
import Link from "next/link";

interface IPost {
  title: string;
  date: string;
  slug: string;
}

const Posts: React.FC<IPost> = ({ title, date, slug }) => {
  return (
    <Link
      href={slug}
      className="group flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
    >
      <h3 className="text-sm font-medium text-foreground group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
        {title}
      </h3>
      <time className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0 ml-4">{date}</time>
    </Link>
  );
};

export default Posts;
