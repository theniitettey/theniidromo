"use client";
import React from "react";
import { useSpotifyNowPlaying } from "@/hooks/useSpotify";
import { SiSpotify } from "react-icons/si";
import Image from "next/image";
import { motion } from "framer-motion";

const EqualizerBar = ({ delay }: { delay: number }) => (
  <motion.span
    className="w-[3px] bg-[#1DB954] rounded-full"
    animate={{
      height: ["8px", "16px", "8px", "12px", "6px", "16px"],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay,
    }}
    style={{ originY: 1 }}
  />
);

const Equalizer = () => (
  <div className="flex items-end gap-[2px] h-4 w-6 shrink-0">
    <EqualizerBar delay={0} />
    <EqualizerBar delay={0.3} />
    <EqualizerBar delay={0.15} />
    <EqualizerBar delay={0.45} />
  </div>
);

export const NowPlaying = () => {
  const { data, isLoading, isError } = useSpotifyNowPlaying();

  if (isLoading) {
    return (
      <div className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] animate-pulse flex items-center gap-3 min-h-[64px]">
        <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (isError || !data || data.disabled) {
    return null; // Hide widget entirely if variables are missing or call failed
  }

  const { isPlaying, title, artist, albumImageUrl, songUrl } = data;

  const hasData = !!title;

  return (
    <a
      href={songUrl || "https://open.spotify.com"}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3.5 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] hover:bg-zinc-50 dark:hover:bg-[#1a1a1a] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
    >
      {/* Album Art */}
      <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
        {albumImageUrl ? (
          <Image
            src={albumImageUrl}
            alt={title || "Album art"}
            fill
            sizes="48px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-zinc-400 dark:text-zinc-600">
            <SiSpotify size={22} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {isPlaying ? (
            <span className="text-[#1DB954] flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1DB954]"></span>
              </span>
              Now Playing
            </span>
          ) : (
            <span>Recently Played</span>
          )}
        </div>

        {hasData ? (
          <div className="mt-0.5 flex flex-col">
            <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 truncate leading-snug group-hover:text-foreground transition-colors">
              {title}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate leading-relaxed">
              {artist}
            </span>
          </div>
        ) : (
          <span className="mt-0.5 font-medium text-xs text-zinc-500">
            Not listening to anything
          </span>
        )}
      </div>

      {/* Status Indicator */}
      <div className="shrink-0 flex items-center">
        {isPlaying ? (
          <Equalizer />
        ) : (
          <SiSpotify
            className="text-zinc-300 dark:text-zinc-700 group-hover:text-[#1DB954] transition-colors duration-300"
            size={18}
          />
        )}
      </div>
    </a>
  );
};
