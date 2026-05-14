"use client";

import { useEffect, useState } from "react";

interface ViewTrackerProps {
  slug: string;
  initialCount?: number;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function ViewTracker({ slug, initialCount = 0 }: ViewTrackerProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const key = `viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    fetch(`/api/posts/${slug}/views`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => setCount(data.count))
      .catch(() => {});
  }, [slug]);

  return <span>{formatCount(count)} reads</span>;
}
