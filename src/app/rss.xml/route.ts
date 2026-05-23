import { allPosts, allThoughts, allAsores } from "@/lib/content";
import { siteConfig } from "@/lib/config";
import { person } from "@/data/person";

export const dynamic = "force-static";

function escape(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const base = siteConfig.url;

  const items = [
    ...allPosts
      .filter((p) => !p.draft && !p.archived)
      .map((p) => ({ ...p, section: "blog post" })),
    ...allThoughts
      .filter((t) => !t.draft && !t.archived)
      .map((t) => ({ ...t, section: "thought" })),
    ...allAsores
      .filter((a) => !a.draft && !a.archived)
      .map((a) => ({ ...a, section: "devotional" })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(person.siteName)}</title>
    <link>${base}</link>
    <description>writing by ${escape(person.shortName)} — posts, thoughts, and devotionals</description>
    <language>en</language>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items
      .map(
        (item) => `<item>
      <title>${escape(item.title)}</title>
      <link>${base}${item.slug}</link>
      <guid isPermaLink="true">${base}${item.slug}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <category>${escape(item.section)}</category>
      ${item.description ? `<description>${escape(item.description)}</description>` : ""}
    </item>`
      )
      .join("\n    ")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
