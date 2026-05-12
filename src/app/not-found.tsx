"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    setHasHistory(window.history.length > 1);
  }, []);

  return (
    <div className="flex flex-col items-start py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
        404
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
        Page not found
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex items-center gap-4">
        {hasHistory && (
          <button
            onClick={() => router.back()}
            className="text-sm text-zinc-500 hover:text-foreground transition-colors"
          >
            ← Go back
          </button>
        )}
        <Link
          href="/"
          className="text-sm text-foreground font-medium hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          Home →
        </Link>
      </div>
    </div>
  );
}
