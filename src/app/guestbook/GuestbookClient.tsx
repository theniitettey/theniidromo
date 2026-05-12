"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiGithub } from "react-icons/si";
import { format } from "date-fns";
import axios from "axios";
import { SignaturePad } from "@/components/ui";
import {
  useGuestbookEntries,
  useSignGuestbook,
  Entry,
} from "@/hooks/useGuestbook";

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

export function GuestbookClient({
  initialEntries,
  session,
  error,
}: GuestbookClientProps) {
  const { data: entries = [] } = useGuestbookEntries(initialEntries);
  const { mutateAsync: signGuestbook, isPending: submitting } =
    useSignGuestbook();

  const [message, setMessage] = useState("");
  const [displayName, setDisplayName] = useState(session?.name || "");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !displayName.trim()) return;
    setFormError("");

    try {
      await signGuestbook({
        message: message.trim(),
        signatureData,
        name: displayName.trim(),
      });
      setMessage("");
      setSignatureData(null); // Triggers SignaturePad to clear internally if we re-render or we can just rely on state.
      // Note: In a fully controlled SignaturePad, passing null here wouldn't automatically clear the canvas visually unless the pad reacts to it.
      // But we will let the user clear it manually or unmount it. Actually, resetting `key` on SignaturePad can force it to unmount!
    } catch (err: any) {
      setFormError(err.message || "Something went wrong");
    }
  }

  async function handleSignOut() {
    await axios.post("/api/auth/signout");
    window.location.reload();
  }

  return (
    <div className="flex flex-col gap-10 mb-20">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground mb-1">
          Guestbook
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Leave a message — I read every one.
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-500">
          Authentication failed. Please try again.
        </p>
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

            <div className="flex flex-col gap-1 mt-2">
              <label
                htmlFor="displayName"
                className="text-xs text-zinc-500 font-medium ml-1"
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name..."
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
              />
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <label
                htmlFor="message"
                className="text-xs text-zinc-500 font-medium ml-1"
              >
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message..."
                maxLength={500}
                rows={3}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 resize-none"
              />
            </div>

            <div className="mt-1">
              {/* Signature Pad */}
              <SignaturePad key={entries.length} onSign={setSignatureData} />
            </div>

            {formError && <p className="text-xs text-red-500">{formError}</p>}
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-zinc-400">
                {message.length}/500
              </span>
              <button
                type="submit"
                disabled={submitting || !message.trim() || !displayName.trim()}
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
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No entries yet. Be the first!
          </p>
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
                <p className="text-sm text-zinc-600 dark:text-zinc-400 break-words whitespace-pre-wrap">
                  {entry.message}
                </p>
                {entry.signature_data && (
                  <div className="mt-2 mix-blend-difference dark:mix-blend-normal dark:invert">
                    <Image
                      src={entry.signature_data}
                      alt="Signature"
                      width={120}
                      height={40}
                      className="opacity-80 dark:opacity-70 pointer-events-none"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
