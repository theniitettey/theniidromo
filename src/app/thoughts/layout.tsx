import type { Metadata } from "next";
import { person } from "@/data/person";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Thoughts | The Nii Dromo",
    description:
      "Short writings and personal reflections by Nii Dromo — on software, life, and everything in between.",
    keywords: [
      "Technical Blog",
      "Software Development Blog",
      "Web Development Articles",
      "Engineering Insights",
      "Tech Thoughts",
      "Developer Blog",
      "Personal Blog",
      "Life Reflections",
      "Personal Growth",
      "General Thoughts",
      "Life Experiences",
      "Creative Writing",
      "Software Engineering",
      "Web Development",
      "Frontend Development",
      "Backend Development",
      "Full-stack Development",
      "React Development",
      "Node.js Development",
      "TypeScript Development",
      "Technical Tutorials",
      "Code Examples",
      "Best Practices",
      "Development Tips",
      "Programming Insights",
      "Tech Industry Trends",
      "Personal Stories",
      "Life Lessons",
      "Nii Dromo",
      "BetaForge Labs Blog",
      "Software Engineer Writing",
      "Developer Lifestyle",
      "Personal Insights",
      "Lifestyle Blog",
      "Tech Life Balance",
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "/thoughts",
      siteName: person.siteName,
      title: "Thoughts | The Nii Dromo",
      description:
        "Short writings and personal reflections by Nii Dromo — on software, life, and everything in between.",
      images: [
        {
          url: "/api/og/thought",
          width: 1200,
          height: 630,
          alt: "Nii Dromo's Thoughts - Technical & Personal Insights",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Thoughts | The Nii Dromo",
      description:
        "Short writings and personal reflections by Nii Dromo — on software, life, and everything in between.",
      images: ["/api/og/thought"],
      creator: person.social.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    alternates: {
      canonical: "/thoughts",
    },
    authors: [
      {
        name: person.shortName,
        url: "/",
      },
    ],
    category: "Thoughts",
    archives: ["Thoughts x Archive"],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
