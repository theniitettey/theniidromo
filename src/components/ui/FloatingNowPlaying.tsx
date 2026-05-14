"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SiSpotify } from "react-icons/si";
import { LuSearch, LuMusic, LuPlus, LuLoader, LuX } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { useSpotifyNowPlaying } from "@/hooks/useSpotify";
import { useDominantColor } from "@/hooks/useDominantColor";
import { MoodAura } from "@/components/ui/MoodAura";
import axios from "axios";
import { toast } from "sonner";

interface TrackResult {
  id: string;
  title: string;
  artist: string;
  albumImageUrl: string;
  uri: string;
}

const EqualizerBar = ({ delay }: { delay: number }) => (
  <div
    className="w-0.5 bg-[#1DB954] rounded-full animate-eq-bar"
    style={{ height: "0.6875rem", transformOrigin: "50% 100%", animationDelay: `${delay}s` }}
  />
);

const HIDDEN_PATHS = ["/", "/music"];

export function FloatingNowPlaying() {
  const pathname = usePathname();
  const { data } = useSpotifyNowPlaying();

  const [collapsed, setCollapsed] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TrackResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [queuing, setQueuing] = useState<string | null>(null);

  const dominantColor = useDominantColor(data?.albumImageUrl);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const shouldRender =
    !HIDDEN_PATHS.includes(pathname) &&
    !!data &&
    !data.disabled &&
    data.isPlaying &&
    !!data.title;

  // Close queue tray on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setQueueOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus search when tray opens
  useEffect(() => {
    if (queueOpen) setTimeout(() => inputRef.current?.focus(), 120);
    else { setQuery(""); setResults([]); }
  }, [queueOpen]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(async () => {
      const q = query.trim();
      if (q.length < 2) { setResults([]); return; }
      setSearching(true);
      try {
        const { data: res } = await axios.get<{ tracks: TrackResult[] }>(
          `/api/spotify/search?q=${encodeURIComponent(q)}`
        );
        setResults(res.tracks || []);
      } catch { /* silent */ }
      finally { setSearching(false); }
    }, 450);
    return () => clearTimeout(t);
  }, [query]);

  const queueTrack = async (track: TrackResult) => {
    setQueuing(track.id);
    const tid = toast.loading(`Adding "${track.title}"…`);
    try {
      const { data: res } = await axios.post("/api/spotify/queue", { uri: track.uri });
      if (res.success) {
        toast.success(`"${track.title}" queued!`, { id: tid, description: track.artist });
        setQuery(""); setResults([]); setQueueOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Couldn't queue — is Spotify active?", { id: tid });
    } finally { setQueuing(null); }
  };

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          key="floating-player"
          ref={wrapperRef}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2"
        >
          {/* ── Queue tray (opens upward) ── */}
          <AnimatePresence>
            {queueOpen && !collapsed && (
              <motion.div
                key="tray"
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="w-64 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-2xl shadow-black/15 dark:shadow-black/50 overflow-hidden"
              >
                {/* Tray header */}
                <div className="flex items-center justify-between px-3.5 pt-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <LuMusic size={10} className="text-[#1DB954]" />
                    Pass the Aux
                  </span>
                  <button
                    onClick={() => setQueueOpen(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    <LuX size={13} />
                  </button>
                </div>

                {/* Search input */}
                <div className="px-3 py-2.5">
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 focus-within:border-zinc-300 dark:focus-within:border-zinc-500 transition-colors">
                    <LuSearch size={13} className="text-zinc-400 shrink-0" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search a track…"
                      className="flex-1 bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none min-w-0"
                    />
                    {searching && <LuLoader size={13} className="text-zinc-400 animate-spin shrink-0" />}
                  </div>
                </div>

                {/* Results */}
                <AnimatePresence>
                  {(results.length > 0 || (query.trim().length >= 2 && !searching)) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="max-h-[220px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80 pb-1"
                    >
                      {results.length > 0 ? results.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => queueTrack(track)}
                          disabled={!!queuing}
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors disabled:opacity-50 group cursor-pointer"
                        >
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                            {track.albumImageUrl ? (
                              <Image src={track.albumImageUrl} alt="" fill sizes="32px" className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <LuMusic size={12} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-[#1DB954] transition-colors">
                              {track.title}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate">{track.artist}</p>
                          </div>
                          <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 group-hover:bg-[#1DB954] transition-colors">
                            {queuing === track.id
                              ? <LuLoader size={11} className="text-zinc-400 animate-spin" />
                              : <LuPlus size={11} className="text-zinc-400 group-hover:text-white transition-colors" />
                            }
                          </div>
                        </button>
                      )) : (
                        <p className="text-center text-xs text-zinc-400 py-5 px-3">No tracks found</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Widget ── */}
          <AnimatePresence mode="wait" initial={false}>
            {collapsed ? (
              /* Collapsed bubble */
              <motion.button
                key="bubble"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                onClick={() => setCollapsed(false)}
                className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-xl shadow-black/20 dark:shadow-black/50 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                style={dominantColor ? { boxShadow: `0 0 18px 4px ${dominantColor}55` } : undefined}
                aria-label="Expand now playing"
              >
                {data?.albumImageUrl ? (
                  <Image src={data.albumImageUrl} alt={data.title || ""} fill sizes="48px" className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <SiSpotify size={20} className="text-[#1DB954]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-1.5 gap-0.5">
                  <EqualizerBar delay={0} />
                  <EqualizerBar delay={0.3} />
                  <EqualizerBar delay={0.15} />
                </div>
              </motion.button>
            ) : (
              /* Expanded pill */
              <motion.div
                key="pill"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="relative overflow-hidden flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl shadow-black/10 dark:shadow-black/40 w-64"
              >
                {/* Mood aura */}
                {data?.vibe && dominantColor && (
                  <MoodAura energy={data.vibe.energy} groove={data.vibe.groove} happiness={data.vibe.happiness} color={dominantColor} compact />
                )}

                {/* Album Art — click to toggle queue */}
                <button
                  onClick={() => setQueueOpen((v) => !v)}
                  className="relative z-10 w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer"
                  aria-label="Toggle queue"
                >
                  {data?.albumImageUrl ? (
                    <Image src={data.albumImageUrl} alt={data.title || ""} fill sizes="36px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <SiSpotify size={16} />
                    </div>
                  )}
                  {queueOpen && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <LuMusic size={14} className="text-white" />
                    </div>
                  )}
                </button>

                {/* Track link */}
                <a
                  href={data?.songUrl || "https://open.spotify.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 flex-1 min-w-0"
                >
                  <p className="text-[10px] font-bold text-[#1DB954] uppercase tracking-wider flex items-center gap-1 leading-none mb-0.5">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1DB954]" />
                    </span>
                    Now Playing
                  </p>
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-snug">
                    {data?.title}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate leading-snug">
                    {data?.artist}
                  </p>
                </a>

                {/* Equalizer */}
                <div className="relative z-10 flex items-end gap-0.5 shrink-0 pb-0.5">
                  <EqualizerBar delay={0} />
                  <EqualizerBar delay={0.3} />
                  <EqualizerBar delay={0.15} />
                  <EqualizerBar delay={0.45} />
                </div>

                {/* Collapse */}
                <button
                  onClick={() => { setCollapsed(true); setQueueOpen(false); }}
                  className="relative z-10 shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-0.5 -mr-0.5"
                  aria-label="Collapse"
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M9 6l-3.5 3.5L2 6M9 1.5L5.5 5 2 1.5" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
