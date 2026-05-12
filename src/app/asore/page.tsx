"use client";
import { allAsores } from "@/lib/content";
import { MotionDiv } from "@/components";
import { formatDistance } from "date-fns";
import Link from "next/link";

const variant = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DevotionalsPage() {
  const devotionals = allAsores
    .filter((post) => !post.archived)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <MotionDiv
      initial="hidden"
      animate="visible"
      variants={variant}
      className="mb-20"
    >
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-2 mb-6">
        Devotionals
      </h1>
      <div className="flex flex-col">
        {devotionals.map((post) => (
          <article
            key={post.slug}
            className="group flex justify-between items-start py-3 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
          >
            <Link href={post.slug} className="flex flex-col gap-0.5 flex-1 pr-4">
              <h2 className="text-sm font-medium text-foreground group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {post.title}
              </h2>
              {post.description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                  {post.description}
                </p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
            <time className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0 pt-0.5">
              {formatDistance(new Date(post.date), new Date(), {
                addSuffix: true,
              })}
            </time>
          </article>
        ))}
      </div>
      <Link
        href="/archive/devotionals"
        className="text-xs text-zinc-400 hover:text-foreground transition-colors mt-8 inline-block"
      >
        Archived devotionals â†’
      </Link>
    </MotionDiv>
  );
}
