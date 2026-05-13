"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiGithub } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { SignaturePad } from "@/components/ui";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
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
  const { mutateAsync: signGuestbook, isPending: submitting } = useSignGuestbook();

  const existingEntry = session
    ? entries.find((entry) => entry.username === session.username) ?? null
    : null;
  const hasSigned = existingEntry !== null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [displayName, setDisplayName] = useState(session?.name || "");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [modalKey, setModalKey] = useState(0);

  // Disable Update when nothing has changed from the existing entry
  const hasChanges = hasSigned
    ? message.trim() !== existingEntry!.message ||
      displayName.trim() !== existingEntry!.name ||
      signatureData !== existingEntry!.signature_data
    : true;

  function openModal(prefill?: Entry) {
    if (prefill) {
      setMessage(prefill.message);
      setDisplayName(prefill.name);
      setSignatureData(prefill.signature_data);
    } else {
      setMessage("");
      setDisplayName(session?.name || "");
      setSignatureData(null);
    }
    setFormError("");
    setModalKey((k) => k + 1); // Force SignaturePad to remount and clear
    setIsModalOpen(true);
  }

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
      setIsModalOpen(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground mb-1">
            Guestbook
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Leave a message — I read every one.
          </p>
        </div>
        {session && (
          <button
            type="button"
            onClick={handleSignOut}
            className="text-[10px] px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-foreground transition-colors"
          >
            Sign out (@{session.username})
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500">
          Authentication failed. Please try again.
        </p>
      )}

      {/* Sign / Edit panel */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        {session ? (
          hasSigned ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                You've already signed. Thanks! 🎉
              </p>
              <button
                onClick={() => openModal(existingEntry!)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-foreground hover:border-zinc-400 transition-colors shrink-0"
              >
                Edit entry
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                You're signed in as @{session.username}.
              </p>
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-foreground text-background hover:opacity-80 transition-opacity"
              >
                Sign Guestbook
              </button>
            </div>
          )
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

      {/* Modal Dialog */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl">
            <DialogTitle className="text-lg font-bold text-foreground mb-4">
              {hasSigned ? "Edit your entry" : "Sign the Guestbook"}
            </DialogTitle>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="displayName" className="text-xs text-zinc-500 font-medium ml-1">
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

              <div className="flex flex-col gap-1">
                <label htmlFor="message" className="text-xs text-zinc-500 font-medium ml-1">
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

              <div>
                <SignaturePad key={modalKey} onSign={setSignatureData} />
                {/* Show existing signature preview in edit mode if no new one drawn */}
                {hasSigned && existingEntry?.signature_data && signatureData === existingEntry.signature_data && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400">Current signature:</span>
                    <img
                      src={existingEntry.signature_data}
                      alt="Current signature"
                      className="h-6 object-contain dark:invert opacity-60"
                    />
                  </div>
                )}
              </div>

              {formError && <p className="text-xs text-red-500">{formError}</p>}

              <div className="flex items-center justify-between mt-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400">{message.length}/500</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg text-zinc-500 hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !message.trim() || !displayName.trim() || (hasSigned && !hasChanges)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-foreground text-background disabled:opacity-40 hover:opacity-80 transition-opacity"
                  >
                    {submitting ? "Saving..." : hasSigned ? "Update" : "Sign"}
                  </button>
                </div>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Entries grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {entries.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 col-span-full">
            No entries yet. Be the first!
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-2 rounded-xl border border-zinc-100 dark:border-zinc-800 p-3"
            >
              {/* Header: avatar + name + date */}
              <div className="flex items-center gap-2">
                <Image
                  src={entry.avatar_url}
                  alt={entry.username}
                  width={24}
                  height={24}
                  style={{ width: "24px", height: "24px" }}
                  className="rounded-full object-cover shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <a
                    href={`https://github.com/${entry.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-foreground hover:opacity-70 transition-opacity truncate"
                  >
                    {entry.name}
                  </a>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="text-[10px] text-zinc-400 dark:text-zinc-500"
                      title={new Date(entry.created_at).toLocaleString()}
                    >
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </span>
                    {entry.updated_at &&
                      Math.abs(
                        new Date(entry.updated_at).getTime() -
                          new Date(entry.created_at).getTime()
                      ) > 10_000 && (
                        <span
                          className="text-[10px] text-zinc-400 dark:text-zinc-600 italic"
                          title={new Date(entry.updated_at).toLocaleString()}
                        >
                          · edited {formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true })}
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <p className="text-sm text-zinc-600 dark:text-zinc-400 break-words whitespace-pre-wrap">
                {entry.message}
              </p>

              {entry.signature_data && (
                <img
                  src={entry.signature_data}
                  alt="Signature"
                  className="h-7 object-contain object-left dark:invert opacity-90 pointer-events-none mt-1"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
