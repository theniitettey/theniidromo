"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { SiGithub } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { siteConfig } from "@/lib/config";
import {
  useReactions,
  useIncrementReaction,
  useComments,
  useAddComment,
  useDeleteComment,
  useAddReply,
  useToggleCommentReaction,
  useToggleReplyReaction,
  Comment,
} from "@/hooks/usePostInteractions";
import { useEffect, useRef } from "react";

interface Session {
  githubId: string;
  username: string;
  name: string;
  avatarUrl: string;
}

interface PostInteractionsProps {
  slug: string;
  session: Session | null;
}

function Avatar({ src, alt, size = 24 }: { src: string; alt: string; size?: number }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="rounded-full object-cover shrink-0"
    />
  );
}

const REACTION_LIST = [
  { type: "thumbs_up", label: "👍", name: "Like" },
  { type: "heart", label: "❤️", name: "Love" },
  { type: "rocket", label: "🚀", name: "Rocket" },
  { type: "celebrate", label: "🎉", name: "Celebrate" },
  { type: "insight", label: "💡", name: "Insight" },
];

function ReactionSelector({
  onSelect,
  onClose,
}: {
  onSelect: (type: string, e: React.MouseEvent) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute bottom-full left-0 mb-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-none rounded-full px-1.5 py-1 flex items-center gap-1 z-10 animate-in fade-in slide-in-from-bottom-2 duration-150 scale-95 group-hover:scale-100 origin-bottom-left"
      onMouseLeave={onClose}
    >
      {REACTION_LIST.map((r) => (
        <button
          key={r.type}
          type="button"
          onClick={(e) => {
            onSelect(r.type, e);
            onClose();
          }}
          className="w-7 h-7 flex items-center justify-center rounded-full text-base hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-125 active:scale-95 transition-all duration-150"
          title={r.name}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function ReactionPills({
  reactionsMap,
  userReaction,
  onToggle,
}: {
  reactionsMap: Record<string, number>;
  userReaction: string | null;
  onToggle: (type: string, e: React.MouseEvent) => void;
}) {
  const activeReactions = Object.entries(reactionsMap).filter(([_, count]) => count > 0);
  if (activeReactions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1.5">
      {activeReactions.map(([type, count]) => {
        const def = REACTION_LIST.find((r) => r.type === type);
        const isMine = userReaction === type;
        if (!def) return null;

        return (
          <button
            key={type}
            type="button"
            onClick={(e) => onToggle(type, e)}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] transition-all active:scale-95 ${
              isMine
                ? "border-pink-300 bg-pink-50/50 dark:border-pink-800/60 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400"
                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <span>{def.label}</span>
            <span className="font-medium tabular-nums">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function CommentItem({
  comment,
  session,
  slug,
  adminUsername,
}: {
  comment: Comment;
  session: Session | null;
  slug: string;
  adminUsername: string;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [commentMenuOpen, setCommentMenuOpen] = useState(false);
  const [replyMenus, setReplyMenus] = useState<Record<number, boolean>>({});
  const [floaters, setFloaters] = useState<{ id: number; x: number; y: number; value: string }[]>([]);
  const floaterCounter = useRef(0);

  const { mutateAsync: addReply, isPending: replyPending } = useAddReply(slug);
  const { mutateAsync: deleteComment, isPending: deleting } = useDeleteComment(slug);
  
  const { mutate: toggleCommentReaction } = useToggleCommentReaction(slug);
  const { mutate: toggleReplyReaction } = useToggleReplyReaction(slug);

  const isOwner = session?.githubId === comment.github_id;
  const isAdmin = session?.username === adminUsername;
  const canDelete = isOwner || isAdmin;

  function emitFloaters(type: string, e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const item = REACTION_LIST.find((r) => r.type === type);
    if (!item) return;

    const isRocket = type === "rocket";
    const numToSpawn = isRocket ? 4 : 1;

    for (let i = 0; i < numToSpawn; i++) {
      const id = ++floaterCounter.current;
      const newFloater = {
        id,
        x: isNaN(x) ? rect.width / 2 : x + (Math.random() - 0.5) * 30,
        y: isNaN(y) ? rect.height / 2 : y + (Math.random() - 0.5) * 20,
        value: item.label,
      };
      setFloaters((prev) => [...prev, newFloater]);
      setTimeout(() => {
        setFloaters((prev) => prev.filter((f) => f.id !== id));
      }, 1000);
    }
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    await addReply({ commentId: comment.id, body: replyText.trim() });
    setReplyText("");
    setReplyOpen(false);
  }

  function handleCommentReact(type: string, e: React.MouseEvent) {
    emitFloaters(type, e);
    toggleCommentReaction({ commentId: comment.id, reaction: type });
  }

  function handleReplyReact(replyId: number, type: string, e: React.MouseEvent) {
    emitFloaters(type, e);
    toggleReplyReaction({ commentId: comment.id, replyId, reaction: type });
  }

  return (
    <div className="flex flex-col gap-2 relative">
      {/* Float Emitter for entire item */}
      {floaters.map((f) => (
        <span
          key={f.id}
          style={{
            position: "absolute",
            left: f.x,
            top: f.y,
            pointerEvents: "none",
            animation: "floatUpAndFade 0.8s cubic-bezier(0.215, 0.61, 0.355, 1) forwards",
            fontSize: f.value === "🚀" ? "18px" : "14px",
            zIndex: 50,
          }}
        >
          {f.value}
        </span>
      ))}

      <div className="flex gap-2.5">
        <Avatar src={comment.avatar_url} alt={comment.name} size={28} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`https://github.com/${comment.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-foreground hover:opacity-70 transition-opacity"
            >
              {comment.name}
            </a>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 break-words leading-relaxed">
            {comment.body}
          </p>
          
          <ReactionPills
            reactionsMap={comment.reactions_map}
            userReaction={comment.user_reaction}
            onToggle={handleCommentReact}
          />

          <div className="flex items-center gap-3.5 mt-1.5">
            {/* React Dropdown Toggle */}
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setCommentMenuOpen(true)}
                onClick={() => setCommentMenuOpen(!commentMenuOpen)}
                className="text-[10px] text-zinc-400 hover:text-foreground transition-colors flex items-center gap-0.5"
              >
                ☺ React
              </button>
              {commentMenuOpen && (
                <ReactionSelector
                  onSelect={handleCommentReact}
                  onClose={() => setCommentMenuOpen(false)}
                />
              )}
            </div>

            {session && (
              <button
                type="button"
                onClick={() => setReplyOpen((v) => !v)}
                className="text-[10px] text-zinc-400 hover:text-foreground transition-colors"
              >
                ↩ Reply
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => deleteComment(comment.id)}
                disabled={deleting}
                className="text-[10px] text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-40"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-9 flex flex-col gap-3 border-l border-zinc-100 dark:border-zinc-800 pl-3 mt-1">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-2">
              <Avatar src={reply.avatar_url} alt={reply.name} size={20} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`https://github.com/${reply.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-foreground hover:opacity-70 transition-opacity"
                  >
                    {reply.name}
                  </a>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 break-words leading-relaxed">
                  {reply.body}
                </p>

                <ReactionPills
                  reactionsMap={reply.reactions_map}
                  userReaction={reply.user_reaction}
                  onToggle={(type, e) => handleReplyReact(reply.id, type, e)}
                />

                <div className="flex items-center mt-1">
                  {/* Reply React Toggle */}
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setReplyMenus((prev) => ({ ...prev, [reply.id]: true }))}
                      onClick={() => setReplyMenus((prev) => ({ ...prev, [reply.id]: !prev[reply.id] }))}
                      className="text-[9px] text-zinc-400 hover:text-foreground transition-colors flex items-center gap-0.5"
                    >
                      ☺ React
                    </button>
                    {replyMenus[reply.id] && (
                      <ReactionSelector
                        onSelect={(type, e) => handleReplyReact(reply.id, type, e)}
                        onClose={() => setReplyMenus((prev) => ({ ...prev, [reply.id]: false }))}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline reply box */}
      {replyOpen && session && (
        <form onSubmit={submitReply} className="ml-9 flex gap-2 items-start mt-1">
          <Avatar src={session.avatarUrl} alt={session.name} size={20} />
          <div className="flex-1 flex gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              maxLength={1000}
              className="flex-1 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 resize-none"
            />
            <button
              type="submit"
              disabled={replyPending || !replyText.trim()}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-foreground text-background disabled:opacity-40 hover:opacity-80 transition-opacity h-fit"
            >
              {replyPending ? "…" : "Reply"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function PostInteractions({ slug, session }: PostInteractionsProps) {
  const { data: reactions } = useReactions(slug);
  const { mutate: incrementReaction } = useIncrementReaction(slug);
  const { data: comments = [], isLoading: commentsLoading } = useComments(slug);
  const { mutateAsync: addComment, isPending: commenting } = useAddComment(slug);

  const [commentText, setCommentText] = useState("");
  const adminUsername = siteConfig.admin.username;

  // Local state to handle rapid-clicking tap mechanics without waiting for the server
  const [pendingDelta, setPendingDelta] = useState(0);
  const [floaters, setFloaters] = useState<{ id: number; x: number; y: number; value: string }[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const floaterCounterRef = useRef(0);

  // Calculated stats based on server count + local pending clicks
  const maxLikes = reactions?.maxLikes ?? 50;
  const serverUserCount = reactions?.userCount ?? 0;
  const currentUserCount = Math.min(serverUserCount + pendingDelta, maxLikes);
  
  const serverTotalCount = reactions?.totalCount ?? 0;
  const currentTotalCount = serverTotalCount + pendingDelta;

  const fillPercentage = (currentUserCount / maxLikes) * 100;
  const hasLiked = currentUserCount > 0;
  const isAtMax = currentUserCount >= maxLikes;

  // Sync local pending increments to the server
  function syncPendingToApi(delta: number) {
    incrementReaction({ delta });
    setPendingDelta(0);
  }

  // Handle tap
  function handleTap(e: React.MouseEvent<HTMLButtonElement>) {
    if (isAtMax) return;

    // Accumulate tap
    setPendingDelta((prev) => {
      const next = prev + 1;
      if (serverUserCount + next > maxLikes) return prev;
      return next;
    });

    // Spawn floating animation bubble
    const rect = e.currentTarget.getBoundingClientRect();
    // Put it near the mouse cursor, or centered inside the button
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newFloater = {
      id: ++floaterCounterRef.current,
      x: isNaN(x) ? rect.width / 2 : x,
      y: isNaN(y) ? rect.height / 2 : y,
      value: `+1`,
    };

    setFloaters((prev) => [...prev, newFloater]);

    // Remove floater after 1s
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== newFloater.id));
    }, 1000);

    // Debounce syncing to server
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      // We capture the value we want to sync right when we fire
      setPendingDelta((currentPending) => {
        if (currentPending > 0) {
          incrementReaction({ delta: currentPending });
        }
        return 0;
      });
    }, 800);
  }

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment(commentText.trim());
    setCommentText("");
  }

  return (
    <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-8">

      {/* ── Reactions ── */}
      <div className="flex items-center gap-3">
        <div className="relative">
          {/* Heart Button */}
          <button
            type="button"
            onClick={handleTap}
            disabled={isAtMax}
            className={`group relative overflow-visible inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border transition-all active:scale-95 ${
              hasLiked
                ? "border-pink-300/50 dark:border-pink-700/40 bg-pink-50/20 dark:bg-pink-950/10"
                : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
            } ${
              isAtMax
                ? "cursor-not-allowed border-pink-400 dark:border-pink-600"
                : "hover:text-foreground"
            } text-zinc-500 dark:text-zinc-400`}
            aria-label="Tap to like"
          >
            {/* Floating bubbles emitter */}
            {floaters.map((floater) => (
              <span
                key={floater.id}
                style={{
                  position: "absolute",
                  left: floater.x,
                  top: floater.y,
                  pointerEvents: "none",
                  transform: "translate(-50%, -50%)",
                  animation: "floatUpAndFade 0.8s cubic-bezier(0.215, 0.61, 0.355, 1) forwards",
                  color: "#ec4899",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {floater.value}
              </span>
            ))}

            {/* Keyframes injected in scope */}
            <style>{`
              @keyframes floatUpAndFade {
                0% {
                  opacity: 1;
                  transform: translate(-50%, -50%) scale(1);
                }
                100% {
                  opacity: 0;
                  transform: translate(-50%, -150%) scale(1.2);
                }
              }
            `}</style>

            {/* Progressive Fill-up Heart SVG */}
            <span className="relative inline-block" style={{ width: 16, height: 16 }}>
              {/* Outline Heart */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={hasLiked ? "#ec4899" : "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-colors duration-300"
                style={{ position: "absolute", inset: 0 }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>

              {/* Filled Layer (Progressive Clip-Path) */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="#ec4899"
                stroke="none"
                style={{
                  position: "absolute",
                  inset: 0,
                  clipPath: `inset(${100 - fillPercentage}% 0 0 0)`,
                  transition: "clip-path 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </span>

            {/* Total Count Text */}
            <span
              className="transition-colors duration-300 tabular-nums"
              style={{ color: hasLiked ? "#ec4899" : undefined }}
            >
              {currentTotalCount}
            </span>
          </button>
        </div>

        {/* Personal Progress Meter or Instructions */}
        {currentUserCount > 0 && (
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              {isAtMax ? "Fully loaded! ❤️" : `Filled ${currentUserCount} / ${maxLikes}`}
            </span>
            {!isAtMax && (
              <span className="text-[9px] text-zinc-400/70 dark:text-zinc-500/50">
                Tap to fill it up
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Comments ── */}
      <div className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold text-foreground">
          {commentsLoading
            ? "Comments"
            : `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`}
        </h2>

        {/* Comment list */}
        {comments.length > 0 && (
          <div className="flex flex-col gap-5">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                session={session}
                slug={slug}
                adminUsername={adminUsername}
              />
            ))}
          </div>
        )}

        {/* Add comment */}
        {session ? (
          <form onSubmit={submitComment} className="flex gap-2.5 items-start">
            <Avatar src={session.avatarUrl} alt={session.name} size={28} />
            <div className="flex-1 flex flex-col gap-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Leave a comment..."
                rows={3}
                maxLength={1000}
                className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">{commentText.length}/1000</span>
                <button
                  type="submit"
                  disabled={commenting || !commentText.trim()}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-foreground text-background disabled:opacity-40 hover:opacity-80 transition-opacity"
                >
                  {commenting ? "Posting..." : "Comment"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-start gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sign in to join the conversation.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/api/auth/github"
                className="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 text-foreground transition-colors"
              >
                <SiGithub size={14} className="text-foreground" />
                GitHub
              </Link>
              <Link
                href="/api/auth/google"
                className="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 text-foreground transition-colors"
              >
                <FcGoogle size={14} />
                Google
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
