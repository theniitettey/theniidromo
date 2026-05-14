"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SiSpotify } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import { useSpotifyNowPlaying } from "@/hooks/useSpotify";

const EqualizerBar = ({ delay }: { delay: number }) => (
  <motion.span
    className="w-[2px] bg-[#1DB954] rounded-full"
    animate={{ height: ["5px", "11px", "5px", "9px", "4px", "11px"] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay }}
    style={{ originY: 1 }}
  />
);

const HIDDEN_PATHS = ["/", "/music"];

export function FloatingNowPlaying() {
  const pathname = usePathname();
  const { data } = useSpotifyNowPlaying();
  const [collapsed, setCollapsed] = useState(false);

  const shouldRender =
    !HIDDEN_PATHS.includes(pathname) &&
    !!data &&
    !data.disabled &&
    data.isPlaying &&
    !!data.title;

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          key="floating-player"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-5 right-4 z-50"
        >
          <AnimatePresence mode="wait" initial={false}>
            {collapsed ? (
              /* ── Collapsed corner bubble ── */
              <motion.button
                key="bubble"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                onClick={() => setCollapsed(false)}
                className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-xl shadow-black/20 dark:shadow-black/50 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                aria-label="Expand now playing"
              >
                {data?.albumImageUrl ? (
                  <Image
                    src={data.albumImageUrl}
                    alt={data.title || "Album art"}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <SiSpotify size={20} className="text-[#1DB954]" />
                  </div>
                )}
                {/* Equalizer overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-1.5 gap-[2px]">
                  <EqualizerBar delay={0} />
                  <EqualizerBar delay={0.3} />
                  <EqualizerBar delay={0.15} />
                </div>
              </motion.button>
            ) : (
              /* ── Expanded pill ── */
              <motion.div
                key="pill"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <a
                  href={data?.songUrl || "https://open.spotify.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl shadow-black/10 dark:shadow-black/40 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors w-[260px]"
                >
                  {/* Album Art */}
                  <div className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {data?.albumImageUrl ? (
                      <Image
                        src={data.albumImageUrl}
                        alt={data.title || "Album art"}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <SiSpotify size={16} />
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
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
                  </div>

                  {/* Equalizer */}
                  <div className="flex items-end gap-[2px] h-3.5 w-[18px] shrink-0">
                    <EqualizerBar delay={0} />
                    <EqualizerBar delay={0.3} />
                    <EqualizerBar delay={0.15} />
                    <EqualizerBar delay={0.45} />
                  </div>

                  {/* Collapse */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCollapsed(true);
                    }}
                    className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-0.5 -mr-0.5"
                    aria-label="Collapse"
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M9 6l-3.5 3.5L2 6M9 1.5L5.5 5 2 1.5" />
                    </svg>
                  </button>
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
