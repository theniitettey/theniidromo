import type { Metadata } from "next";
import { allPosts } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const activePosts = allPosts.filter((post) => !post.archived);
  const postCount = activePosts.length;

  let latestPostDate = "";
  if (postCount > 0) {
    const dates = activePosts.map((post) => new Date(post.date));
    const mostRecent = new Date(
      Math.max(...dates.map((date) => date.getTime()))
    );
    latestPostDate = mostRecent.toISOString();
  }

  const topics = [...new Set(activePosts.flatMap((post) => post.tags || []))];
  const topTopics = topics.slice(0, 5).join(", ");

  const title = "Blog | The Nii Dromo";
  const description =
    postCount > 0
      ? `Explore ${postCount} articles on ${
          topTopics || "various topics"
        }. Personal insights, technical writings, and thoughts by Nii Dromo.`
      : "Personal blog featuring insights, technical writings, and thoughts by Nii Dromo.";

  return {
    title,
    description,

    openGraph: {
      type: "website",
      title,
      description,
      url: "/blog",
      images: [
        {
          url: "/api/og/blog",
          width: 1200,
          height: 630,
          alt: "Nii Dromo Blog",
        },
      ],
      siteName: "The Nii Dromo",
      ...(latestPostDate && { modifiedTime: latestPostDate }),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@theniitettey",
      images: ["/api/og/blog"],
    },

    alternates: {
      canonical: "/blog",
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    authors: [
      {
        name: "Nii Dromo",
        url: "/",
      },
    ],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
