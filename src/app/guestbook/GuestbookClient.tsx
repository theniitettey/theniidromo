"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiGithub } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { format } from "date-fns";
import axios from "axios";
import { SignaturePad } from "@/components/ui";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  useGuestbookEntries,
  useSignGuestbook,
  Entry,
} from "@/hooks/useGuestbook";

interface Session {
  userId: string;
  username: string;
  name: string;
  avatarUrl: string;
}

interface GuestbookClientProps {
  initialEntries: Entry[];
  session: Session | null;
  error?: string;
}

type ViewMode = "grid" | "wall";

/** Deterministic pseudo-random number seeded from an integer, returns 0..1 */
function seededRandom(seed: number, offset = 0) {
  const x = Math.sin(seed * 9301 + offset * 49297 + 233) * 93456;
  return x - Math.floor(x);
}

export function GuestbookClient({
  initialEntries,
  session,
  error,
}: GuestbookClientProps) {
  const { data: entries = [] } = useGuestbookEntries(initialEntries);
  const { mutateAsync: signGuestbook, isPending: submitting } = useSignGuestbook();

  const existingEntry = session
    ? entries.find((entry) => entry.github_id === session.userId) ?? null
    : null;
  const hasSigned = existingEntry !== null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [displayName, setDisplayName] = useState(session?.name || "");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [modalKey, setModalKey] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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
    setModalKey((k) => k + 1);
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

  // Stable vertical offsets for wall view — each sig gets a y% offset within the canvas
  const wallOffsets = useMemo(
    () =>
      entries
        .filter((e) => e.signature_data)
        .map((entry) => {
          const id = entry.id;
          const translateY = (seededRandom(id, 1) - 0.5) * 60; // -30% to +30% of container height
          const rotate = (seededRandom(id, 2) - 0.5) * 18; // -9deg to +9deg
          const scale = 0.8 + seededRandom(id, 3) * 0.5; // 0.8–1.3
          return { translateY, rotate, scale };
        }),
    [entries]
  );

  const signedEntries = entries.filter((e) => e.signature_data);

  return (
    <>
      {/* ── The Wall — full-screen overlay ──────────────────────── */}
      {viewMode === "wall" && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "#0c0c0c" }}
        >
          {/* Minimal top bar */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <span className="text-xs font-semibold tracking-widest uppercase text-zinc-500 select-none">
              The Wall
            </span>

            <div className="flex items-center gap-3">
              {session ? (
                hasSigned ? (
                  <button
                    type="button"
                    onClick={() => openModal(existingEntry!)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                  >
                    Edit my entry
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openModal()}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white text-black hover:opacity-80 transition-opacity"
                  >
                    Sign the Guestbook
                  </button>
                )
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-500 mr-0.5">Sign in:</span>
                  <Link
                    href="/api/auth/github"
                    title="Sign in with GitHub"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    <SiGithub size={14} />
                  </Link>
                  <Link
                    href="/api/auth/google"
                    title="Sign in with Google"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    <FcGoogle size={14} />
                  </Link>
                </div>
              )}

              {/* Close / back to grid */}
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Close wall view"
                className="text-zinc-600 hover:text-white transition-colors p-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Horizontal scroll canvas */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            {signedEntries.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-zinc-700">No signatures yet — be the first to sign!</p>
              </div>
            ) : (
              <div
                className="flex flex-row items-center h-full"
                style={{ paddingInline: "10vw", gap: "clamp(48px, 8vw, 120px)" }}
              >
                {signedEntries.map((entry, i) => {
                  const pos = wallOffsets[i] ?? { translateY: 0, rotate: 0, scale: 1 };
                  return (
                    <div
                      key={entry.id}
                      className="shrink-0 select-none"
                      title={entry.name}
                      style={{
                        transform: `translateY(${pos.translateY}%) rotate(${pos.rotate}deg) scale(${pos.scale})`,
                      }}
                    >
                      <img
                        src={entry.signature_data!}
                        alt={`${entry.name}'s signature`}
                        className="invert opacity-90 pointer-events-none"
                        style={{
                          height: "clamp(40px, 6vh, 80px)",
                          maxWidth: "200px",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main guestbook view ─────────────────────────────────── */}
      <div className="flex flex-col gap-8 mb-20">

        {error && (
          <p className="text-xs text-red-500">
            Authentication failed. Please try again.
          </p>
        )}

        {session ? (
          /* ── Signed-in header ── */
          <div className="flex flex-col gap-4">
            {/* Avatar + greeting */}
            <div className="flex items-center gap-3">
              <Image
                src={session.avatarUrl}
                alt={session.name}
                width={36}
                height={36}
                style={{ width: "36px", height: "36px" }}
                className="rounded-full object-cover shrink-0"
              />
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Hello, {session.name}!
              </h1>
            </div>

            {/* Action row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal(hasSigned ? existingEntry! : undefined)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {hasSigned ? "Edit entry" : "Sign guestbook"}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("wall")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-foreground hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3h18v18H3z"/><path d="M7 8l2 2-2 2M12 6v12M17 8l-2 2 2 2"/>
                  </svg>
                  See the Wall
                </button>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-foreground transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign out
              </button>
            </div>
          </div>
        ) : (
          /* ── Signed-out header ── */
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground mb-1">
                  Guestbook
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Leave a message — I read every one.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-0.5">
                  Sign in to leave a message.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href="/api/auth/github"
                    className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground transition-colors"
                  >
                    <SiGithub size={13} />
                    GitHub
                  </Link>
                  <Link
                    href="/api/auth/google"
                    className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground transition-colors"
                  >
                    <FcGoogle size={13} />
                    Google
                  </Link>
                </div>
              </div>
            </div>

            {/* Wall toggle — signed-out */}
            <button
              type="button"
              onClick={() => setViewMode("wall")}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-foreground hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors shrink-0 self-start"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3h18v18H3z"/><path d="M7 8l2 2-2 2M12 6v12M17 8l-2 2 2 2"/>
              </svg>
              See the Wall
            </button>
          </div>
        )}

        {/* Modal Dialog */}
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-[60]">
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

        {/* Grid view */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {entries.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 col-span-full">
              No entries yet. Be the first!
            </p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 h-40 overflow-hidden"
              >
                {/* Message */}
                <p className="text-sm text-zinc-700 dark:text-zinc-300 break-words whitespace-pre-wrap leading-relaxed flex-1">
                  {entry.message}
                </p>

                {/* Footer: avatar + meta left, signature right */}
                <div className="flex items-end justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-2 min-w-0">
                    <Image
                      src={entry.avatar_url}
                      alt={entry.username}
                      width={22}
                      height={22}
                      style={{ width: "22px", height: "22px" }}
                      className="rounded-full object-cover shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      {entry.provider === "github" ? (
                        <a
                          href={`https://github.com/${entry.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-foreground hover:opacity-70 transition-opacity truncate"
                        >
                          {entry.name}
                        </a>
                      ) : (
                        <span className="text-xs font-semibold text-foreground truncate">{entry.name}</span>
                      )}
                      <span
                        className="text-[10px] text-zinc-400 dark:text-zinc-500"
                        title={new Date(entry.created_at).toLocaleString()}
                      >
                        {format(new Date(entry.created_at), "MMM d, yyyy, h:mm a")}
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
                            edited
                          </span>
                        )}
                    </div>
                  </div>

                  {entry.signature_data && (
                    <img
                      src={entry.signature_data}
                      alt="Signature"
                      className="h-8 max-w-[100px] object-contain object-right dark:invert opacity-90 pointer-events-none shrink-0"
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
