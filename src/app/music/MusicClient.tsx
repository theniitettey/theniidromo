"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SiSpotify } from "react-icons/si";
import { LuClock, LuPlay, LuUser, LuMusic, LuTrophy, LuExternalLink } from "react-icons/lu";
import { NowPlaying, DjQueueWidget, MotionDiv, MotionHeader } from "@/components";

interface TopTrack {
  rank: number;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  url: string;
  durationMs: number;
}

interface TopArtist {
  rank: number;
  name: string;
  imageUrl: string;
  url: string;
  genres: string[];
  followers: number;
}

type MediaType = "tracks" | "artists";
type TimeRange = "short_term" | "medium_term" | "long_term";

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 25 } },
} as const;

export const MusicClient = () => {
  const [type, setType] = useState<MediaType>("tracks");
  const [range, setRange] = useState<TimeRange>("short_term");

  // Fetch dynamic top lists from API route
  const { data, isLoading, isError } = useQuery({
    queryKey: ["spotify-top", type, range],
    queryFn: async () => {
      const { data } = await axios.get<{ items: any[]; error?: string }>(
        `/api/spotify/top?type=${type}&range=${range}`
      );
      return data.items || [];
    },
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes client-side
  });

  return (
    <div className="flex flex-col gap-8 mb-20 mt-2">
      {/* Page Header */}
      <MotionHeader
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col"
      >
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 text-foreground">
          Music & Vibes
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          A live-sync dashboard exposing what's on Michael's rotation. 
          Pass the aux to add a track to his live queue, or check his all-time charts below.
        </p>
      </MotionHeader>

      {/* Header Actions Section (Live Controls) */}
      <MotionDiv
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4"
      >
        <NowPlaying />
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-[#121212]/30 backdrop-blur-sm">
          <DjQueueWidget />
        </div>
      </MotionDiv>

      {/* Filters Dashboard */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
          {/* Main Type Select (Tracks vs Artists) */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 w-fit self-start">
            <button
              onClick={() => setType("tracks")}
              className={`relative px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                type === "tracks"
                  ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
            >
              <LuMusic size={13} />
              Tracks
            </button>
            <button
              onClick={() => setType("artists")}
              className={`relative px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                type === "artists"
                  ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
            >
              <LuUser size={13} />
              Artists
            </button>
          </div>

          {/* Time Range select buttons */}
          <div className="flex items-center gap-1.5">
            {(
              [
                { value: "short_term", label: "4 Weeks" },
                { value: "medium_term", label: "6 Months" },
                { value: "long_term", label: "All Time" },
              ] as const
            ).map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                  range === r.value
                    ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 border-transparent shadow-sm"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-950"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Display Area */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full h-16 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 animate-pulse bg-zinc-50 dark:bg-[#121212]/50" />
              ))}
            </motion.div>
          ) : isError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl"
            >
              <SiSpotify size={30} className="text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Failed to load favorite lists
              </h3>
              <p className="text-xs text-zinc-400 max-w-[240px]">
                Ensure the Spotify API integrations have successfully authorized your scopes.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`${type}-${range}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 gap-2"
            >
              {data && data.length > 0 ? (
                type === "tracks" ? (
                  (data as TopTrack[]).map((track) => (
                    <motion.a
                      key={track.rank}
                      variants={itemVariants}
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#121212] hover:bg-zinc-50 dark:hover:bg-[#161616] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
                    >
                      <div className="w-6 shrink-0 flex items-center justify-center text-center text-xs font-bold text-zinc-400 group-hover:text-[#1DB954] transition-colors">
                        {track.rank === 1 ? <LuTrophy size={13} className="text-amber-500" /> : track.rank}
                      </div>
                      
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                        {track.albumImageUrl ? (
                          <Image
                            src={track.albumImageUrl}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <LuMusic size={16} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                        <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 truncate leading-snug group-hover:text-foreground transition-colors flex items-center gap-1.5">
                          {track.title}
                          <LuExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate leading-relaxed">
                          {track.artist}
                        </span>
                      </div>

                      <div className="shrink-0 text-[10px] text-zinc-400 font-medium flex items-center gap-1 pr-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                        <LuClock size={11} />
                        {formatDuration(track.durationMs)}
                      </div>
                    </motion.a>
                  ))
                ) : (
                  (data as TopArtist[]).map((artist) => (
                    <motion.a
                      key={artist.rank}
                      variants={itemVariants}
                      href={artist.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#121212] hover:bg-zinc-50 dark:hover:bg-[#161616] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
                    >
                      <div className="w-6 shrink-0 flex items-center justify-center text-center text-xs font-bold text-zinc-400 group-hover:text-[#1DB954] transition-colors">
                        {artist.rank === 1 ? <LuTrophy size={13} className="text-amber-500" /> : artist.rank}
                      </div>

                      <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                        {artist.imageUrl ? (
                          <Image
                            src={artist.imageUrl}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <LuUser size={16} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                        <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 truncate leading-snug group-hover:text-foreground transition-colors flex items-center gap-1.5">
                          {artist.name}
                          <LuExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate leading-relaxed uppercase font-bold tracking-wider mt-0.5">
                          {artist.genres.join(" • ") || "Artist"}
                        </span>
                      </div>

                      <div className="shrink-0 flex items-center pr-2 text-zinc-300 dark:text-zinc-800 group-hover:text-[#1DB954] transition-all duration-300 group-hover:scale-110">
                        <LuPlay size={20} />
                      </div>
                    </motion.a>
                  ))
                )
              ) : (
                <div className="py-10 text-center flex flex-col items-center justify-center text-zinc-500 text-xs">
                  No data available for this time range.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
