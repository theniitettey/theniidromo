import type { Metadata } from "next";
import { allAsores } from "@/lib/content";
import { person } from "@/data/person";

export async function generateMetadata(): Promise<Metadata> {
  const archivedDevotionals = allAsores.filter(
    (devotional) => devotional.archived
  );
  const devotionalCount = archivedDevotionals.length;

  let dateRange = "";
  if (devotionalCount > 0) {
    const dates = archivedDevotionals.map(
      (devotional) => new Date(devotional.date)
    );
    const oldestDevotional = new Date(
      Math.min(...dates.map((date) => date.getTime()))
    );
    const newestDevotional = new Date(
      Math.max(...dates.map((date) => date.getTime()))
    );
    dateRange = `from ${oldestDevotional.getFullYear()} to ${newestDevotional.getFullYear()}`;
  }

  const title = "Devotional Archive | The Nii Dromo";
  const description =
    devotionalCount > 0
      ? `Access ${devotionalCount} archived daily devotionals ${dateRange}. A collection of spiritual reflections and biblical insights by Nii Dromo.`
      : "Archive of past daily devotionals and spiritual reflections by Nii Dromo.";

  return {
    title,
    description,

    openGraph: {
      type: "website",
      title,
      description,
      url: "/archive/devotionals",
      images: [
        {
          url: "/api/og/dev-archive",
          width: 1200,
          height: 630,
          alt: "Devotional Archive",
        },
      ],
      siteName: person.siteName,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: person.social.twitterHandle,
      images: ["/api/og/dev-archive"],
    },

    alternates: {
      canonical: "/archive/devotionals",
    },
    keywords: [
      "daily devotionals",
      "spiritual reflections",
      "Christian devotionals",
      "bible study",
      "spiritual growth",
      "Christian meditation",
      "daily scripture",
      "archived devotionals",
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
