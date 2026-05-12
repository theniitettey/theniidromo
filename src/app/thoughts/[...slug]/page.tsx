import { notFound } from "next/navigation";
import { allThoughts } from "@/.contentlayer/generated";
import { Metadata } from "next";
import { MotionDiv } from "@/components";
import MDXComponent from "@/components/MdxComponent";
import { format } from "date-fns";
import Link from "next/link";

interface ThoughtsProps {
  params: Promise<{
    slug: string[];
  }>;
}

const variant = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

async function getThoughtsFromParams(slug: string[]): Promise<any | null> {
  const slugString = slug.join("/");
  return allThoughts.find((thought) => thought.slugAsParams === slugString) ?? null;
}

export async function generateMetadata({
  params,
}: ThoughtsProps): Promise<Metadata> {
  const resolvedParams = await params;
  const thought = await getThoughtsFromParams(resolvedParams.slug);

  if (!thought) {
    return {
      title: "Not Found | Nii Dromo",
      description: "The requested thought could not be found.",
    };
  }

  const formattedDate = format(new Date(thought.date), "d MMM, yyyy");
  const postTitle = thought.title.charAt(0).toUpperCase() + thought.title.slice(1);

  return {
    title: `${postTitle} | Thoughts | The Nii Dromo`,
    description: `Thought for ${formattedDate} by Nii Dromo`,
    openGraph: {
      type: "article",
      title: postTitle,
      description: `Thought for ${formattedDate} by Nii Dromo`,
      url: thought.slug,
      publishedTime: new Date(thought.date).toISOString(),
      authors: ["Nii Dromo"],
      images: [
        {
          url: `/api/og/thoughts?title=${encodeURIComponent(postTitle)}&date=${encodeURIComponent(thought.date)}`,
          width: 1200,
          height: 630,
          alt: postTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: postTitle,
      description: `Thought for ${formattedDate} by Nii Dromo`,
      creator: "@theniitettey",
      images: [
        `/api/og/thoughts?title=${encodeURIComponent(postTitle)}&date=${encodeURIComponent(thought.date)}`,
      ],
    },
    alternates: {
      canonical: thought.slug,
    },
  };
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return allThoughts.map((thought) => ({
    slug: thought.slugAsParams.split("/"),
  }));
}

export default async function ThoughtPage({ params }: ThoughtsProps) {
  const resolvedParams = await params;
  const thought = await getThoughtsFromParams(resolvedParams.slug);

  if (!thought) notFound();

  return (
    <div className="mb-20">
      <MotionDiv initial="hidden" animate="visible" variants={variant}>
        <div className="pt-2 pb-6">
          <Link
            href="/thoughts"
            className="text-xs text-zinc-500 hover:text-foreground transition-colors mb-3 inline-block"
          >
            ← Thoughts
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
            {thought.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mb-3">
            <time>
              {new Date(thought.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span>·</span>
            <span>{thought.readTimeMinutes}</span>
          </div>
          {thought.description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
              {thought.description}
            </p>
          )}
          {thought.tags && thought.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-8">
              {thought.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <article className="prose prose-sm dark:prose-invert max-w-none prose-zinc prose-a:underline-offset-4 prose-pre:p-0 prose-pre:bg-transparent">
            <MDXComponent code={thought.body.code} />
          </article>
        </div>
      </MotionDiv>
    </div>
  );
}
