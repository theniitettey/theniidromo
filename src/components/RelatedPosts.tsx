import { allPosts } from "@/lib/content";
import Link from "next/link";
import { format } from "date-fns";

type ContentItem = {
  slug: string;
  slugAsParams: string;
  title: string;
  date: string;
  tags?: string[];
  draft: boolean;
  archived: boolean;
};

interface RelatedPostsProps {
  tags: string[];
  currentSlug: string;
  collection?: ContentItem[];
  label?: string;
}

export function RelatedPosts({ tags, currentSlug, collection = allPosts, label = "Related Posts" }: RelatedPostsProps) {
  const related = collection
    .filter((p) => !p.draft && !p.archived && p.slugAsParams !== currentSlug)
    .map((p) => ({
      post: p,
      shared: (p.tags ?? []).filter((t) => tags.includes(t)).length,
    }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 3)
    .map(({ post }) => post);

  if (related.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
        {label}
      </h3>
      <div className="flex flex-col gap-3">
        {related.map((post) => (
          <Link
            key={post.slug}
            href={post.slug}
            className="group flex flex-col gap-1 p-3 -mx-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-foreground transition-colors leading-snug">
              {post.title}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">
                {format(new Date(post.date), "MMM d, yyyy")}
              </span>
              {post.tags && post.tags.length > 0 && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <div className="flex gap-1 flex-wrap">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
