"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiGithub } from "react-icons/si";
import { format } from "date-fns";

interface Entry {
  id: number;
  username: string;
  name: string;
  avatar_url: string;
  message: string;
  created_at: string;
}

interface Session {
  githubId: number;
  username: string;
  name: string;
  avatarUrl: string;
}

interface GuestbookClientProps {
  initialEntries: Entry[];
  session: Session | null;
  error?: string;
}

export function GuestbookClient({ initialEntries, session, error }: GuestbookClientProps) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setFormError("");

    const res = await fetch("/api/guestbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message.trim() }),
    });

    if (res.ok) {
      const entry = await res.json() as Entry;
      setEntries((prev) => [entry, ...prev]);
      setMessage("");
    } else {
      const body = await res.json() as { error?: string };
      setFormError(body.error ?? "Something went wrong");
    }
    setSubmitting(false);
  }

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="flex flex-col gap-10 mb-20">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground mb-1">Guestbook</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Leave a message — I read every one.
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-500">Authentication failed. Please try again.</p>
      )}

      {/* Sign form */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        {session ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src={session.avatarUrl}
                  alt={session.username}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Signed in as{" "}
                  <a
                    href={`https://github.com/${session.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:opacity-70 transition-opacity"
                  >
                    @{session.username}
                  </a>
                </span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-[10px] text-zinc-400 hover:text-foreground transition-colors"
              >
                Sign out
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message..."
              maxLength={500}
              rows={3}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 resize-none"
            />
            {formError && <p className="text-xs text-red-500">{formError}</p>}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">{message.length}/500</span>
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-foreground text-background disabled:opacity-40 hover:opacity-80 transition-opacity"
              >
                {submitting ? "Signing..." : "Sign"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sign in with GitHub to leave a message.
            </p>
            <Link
              href="/api/auth/github"
              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-foreground text-background hover:opacity-80 transition-opacity"
            >
              <SiGithub size={13} />
              Sign in with GitHub
            </Link>
          </div>
        )}
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-4">
        {entries.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">No entries yet. Be the first!</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex gap-3">
              <Image
                src={entry.avatar_url}
                alt={entry.username}
                width={28}
                height={28}
                className="rounded-full shrink-0 mt-0.5"
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <a
                    href={`https://github.com/${entry.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-foreground hover:opacity-70 transition-opacity"
                  >
                    {entry.name}
                  </a>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">
                    {format(new Date(entry.created_at), "d MMM yyyy")}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 break-words">
                  {entry.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
