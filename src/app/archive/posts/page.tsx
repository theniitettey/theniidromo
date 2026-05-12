import { allPosts } from "@/.contentlayer/generated";
import Link from "next/link";

export default function ArchivePage() {
  const archivedPosts = allPosts
    .filter((post) => post.archived)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="mb-20">
      <Link
        href="/blog"
        className="text-xs text-zinc-500 hover:text-foreground transition-colors mt-2 inline-block"
      >
        ← Blog
      </Link>
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-4 mb-8">
        Archived Posts
      </h1>
      <div className="flex flex-col">
        {archivedPosts.length > 0 ? (
          archivedPosts.map((post) => (
            <article
              key={post._id}
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
              </Link>
            </article>
          ))
        ) : (
          <p className="text-sm text-zinc-500">No archived posts.</p>
        )}
      </div>
    </div>
  );
}
