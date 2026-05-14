import { NextRequest, NextResponse } from "next/server";
import { allPosts, allThoughts, allAsores } from "@/lib/content";

export interface SearchResult {
  slug: string;
  title: string;
  type: "post" | "thought" | "asore";
  description?: string;
  tags?: string[];
  date: string;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim() ?? "";

  if (q.length < 2) return NextResponse.json({ results: [] });

  const score = (item: SearchResult): number => {
    let s = 0;
    if (item.title.toLowerCase().includes(q)) s += 3;
    if (item.description?.toLowerCase().includes(q)) s += 1;
    if (item.tags?.some((t) => t.toLowerCase().includes(q))) s += 2;
    return s;
  };

  const posts: SearchResult[] = allPosts
    .filter((p) => !p.draft && !p.archived)
    .map((p) => ({ slug: p.slug, title: p.title, type: "post", description: p.description, tags: p.tags, date: p.date }));

  const thoughts: SearchResult[] = allThoughts.map((t) => ({
    slug: t.slug, title: t.title, type: "thought", date: t.date,
  }));

  const asores: SearchResult[] = allAsores
    .filter((a) => !a.draft && !a.archived)
    .map((a) => ({ slug: a.slug, title: a.title, type: "asore", tags: a.tags, date: a.date }));

  const results = [...posts, ...thoughts, ...asores]
    .map((item) => ({ item, score: score(item) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ item }) => item);

  return NextResponse.json({ results });
}
