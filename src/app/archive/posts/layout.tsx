import type { Metadata } from "next";
import { allPosts } from "@/lib/content";
import { person } from "@/data/person";

export async function generateMetadata(): Promise<Metadata> {
  const archivedPosts = allPosts.filter((post) => post.archived);
  const postCount = archivedPosts.length;

  let dateRange = "";
  if (postCount > 0) {
    const dates = archivedPosts.map((post) => new Date(post.date));
    const oldestPost = new Date(
      Math.min(...dates.map((date) => date.getTime()))
    );
    const newestPost = new Date(
      Math.max(...dates.map((date) => date.getTime()))
    );
    dateRange = `from ${oldestPost.getFullYear()} to ${newestPost.getFullYear()}`;
  }

  const title = "Archive | The Nii Dromo";
  const description =
    postCount > 0
      ? `Browse ${postCount} archived blog posts ${dateRange}. A collection of past writings and thoughts by Nii Dromo.`
      : "Archive of past blog posts by Nii Dromo.";

  return {
    title,
    description,

    openGraph: {
      type: "website",
      title,
      description,
      url: "/archive/posts",
      images: [
        {
          url: "/api/og/post-archive",
          width: 1200,
          height: 630,
          alt: "Blog Archive",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: person.social.twitterHandle,
      images: ["/api/og/post-archive"],
    },

    alternates: {
      canonical: "/archive/posts",
    },
  };
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
