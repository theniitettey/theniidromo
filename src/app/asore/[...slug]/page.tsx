import { notFound } from "next/navigation";
import { allAsores } from "@/lib/content";
import { Metadata } from "next";
import { MotionDiv } from "@/components";
import MDXComponent from "@/components/MdxComponent";
import { format } from "date-fns";
import { person } from "@/data/person";
import Link from "next/link";

interface DevotionalProps {
  params: Promise<{
    slug: string[];
  }>;
}

const variant = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

async function getPostFromParams(slug: string[]): Promise<any | null> {
  const slugString = slug.join("/");
  return allAsores.find((devotional) => devotional.slugAsParams === slugString) ?? null;
}

export async function generateMetadata({
  params,
}: DevotionalProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostFromParams(resolvedParams.slug);

  if (!post) {
    return {
      title: "Not Found | Nii Dromo",
      description: "The requested devotional could not be found.",
    };
  }

  const formattedDate = format(new Date(post.date), "d MMM, yyyy");
  const postTitle = post.title.charAt(0).toUpperCase() + post.title.slice(1);

  return {
    title: `${postTitle} | Devotional | The Nii Dromo`,
    description: post.description || `Devotional from ${formattedDate} by Nii Dromo`,
    keywords: post.tags || [],
    openGraph: {
      type: "article",
      title: postTitle,
      description: post.description || `Devotional from ${formattedDate} by Nii Dromo`,
      url: post.slug,
      publishedTime: new Date(post.date).toISOString(),
      authors: [person.shortName],
      images: [
        {
          url: `/api/og/content?${new URLSearchParams({
            text: "devotional",
            title: postTitle,
            description: post.description || `Devotional from ${formattedDate}`,
            date: new Date(post.date).toISOString(),
          }).toString()}`,
          width: 1200,
          height: 630,
          alt: postTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: postTitle,
      description: post.description || `Devotional from ${formattedDate} by Nii Dromo`,
      creator: person.social.twitterHandle,
      images: [
        `/api/og/content?${new URLSearchParams({
          text: "devotional",
          title: postTitle,
          description: post.description || `Devotional from ${formattedDate}`,
          date: new Date(post.date).toISOString(),
        }).toString()}`,
      ],
    },
    alternates: {
      canonical: post.slug,
    },
  };
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return allAsores.map((devotional) => ({
    slug: devotional.slugAsParams.split("/"),
  }));
}

export default async function DevotionalPage({ params }: DevotionalProps) {
  const resolvedParams = await params;
  const post = await getPostFromParams(resolvedParams.slug);

  if (!post) notFound();

  return (
    <div className="mb-20">
      <MotionDiv initial="hidden" animate="visible" variants={variant}>
        <div className="pt-2 pb-6">
          <Link
            href="/asore"
            className="text-xs text-zinc-400 hover:text-foreground transition-colors mb-6 inline-block"
          >
            ← devotionals
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mb-5">
            <time>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span>·</span>
            <span>{post.readTimeMinutes}</span>
          </div>
          {post.description && (
            <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
              {post.description}
            </p>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-8 border-t border-zinc-100 dark:border-zinc-800 pt-8">
            <article className="prose prose-sm dark:prose-invert max-w-none prose-zinc prose-a:underline-offset-4 prose-pre:p-0 prose-pre:bg-transparent">
              <MDXComponent code={post.body} />
            </article>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
