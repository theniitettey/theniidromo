"use client";
import React, { useEffect, useState } from "react";
import { useSpotifyNowPlaying } from "@/hooks/useSpotify";
import { useDominantColor } from "@/hooks/useDominantColor";
import { SiSpotify } from "react-icons/si";
import Image from "next/image";
import { motion } from "framer-motion";

const EqualizerBar = ({ delay }: { delay: number }) => (
  <motion.span
    className="w-[3px] bg-[#1DB954] rounded-full"
    animate={{ height: ["8px", "16px", "8px", "12px", "6px", "16px"] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay }}
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

interface VibeProps {
  energy: number;
  groove: number;
  happiness: number;
  color: string;
}

const MoodAura = ({ energy, groove, happiness, color }: VibeProps) => {
  const energySpeed = 6 - (energy   / 100) * 4;
  const grooveRange = 10 + (groove  / 100) * 22;
  const grooveSpeed = 8 - (groove   / 100) * 5;
  const happyScale  = 1 + (happiness / 100) * 0.35;
  const happySpeed  = 5 - (happiness / 100) * 2.5;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-0">
      <motion.div
        className="absolute left-[10%] top-[15%] w-24 h-24 rounded-full blur-xl opacity-[0.35]"
        style={{ background: color }}
        animate={{ y: [-energySpeed * 4, energySpeed * 4, -energySpeed * 4] }}
        transition={{ duration: energySpeed * 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[12%] bottom-[10%] w-20 h-20 rounded-full blur-xl opacity-[0.25]"
        style={{ background: color }}
        animate={{
          x: [0, grooveRange, 0, -grooveRange, 0],
          y: [0, grooveRange * 0.6, grooveRange * 0.9, grooveRange * 0.6, 0],
        }}
        transition={{ duration: grooveSpeed, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-[45%] top-[40%] w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl opacity-[0.20]"
        style={{ background: color }}
        animate={{ scale: [1, happyScale, 1] }}
        transition={{ duration: happySpeed, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export const NowPlaying = () => {
  const { data, isLoading, isError } = useSpotifyNowPlaying();
  const dominantColor = useDominantColor(data?.albumImageUrl);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (data?.isPlaying && typeof data?.progressMs === "number") {
      setProgress(data.progressMs);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (data.durationMs && prev >= data.durationMs) { clearInterval(interval); return prev; }
          return prev + 1000;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setProgress(data?.progressMs || 0);
    }
  }, [data?.progressMs, data?.isPlaying, data?.durationMs]);

  if (isLoading) {
    return (
      <div className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] animate-pulse flex items-center gap-3 min-h-[68px]">
        <div className="w-11 h-11 bg-zinc-200 dark:bg-zinc-800 rounded-lg shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (isError || !data || data.disabled) return null;

  const { isPlaying, title, artist, albumImageUrl, songUrl, durationMs, vibe } = data;
  const hasData = !!title;
  const percentage = durationMs && durationMs > 0 ? Math.min((progress / durationMs) * 100, 100) : 0;

  return (
    <a
      href={songUrl || "https://open.spotify.com"}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden flex flex-col items-stretch rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] hover:bg-zinc-50 dark:hover:bg-[#161616] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
    >
      {/* Mood aura — rendered behind everything */}
      {vibe && isPlaying && (
        <MoodAura energy={vibe.energy} groove={vibe.groove} happiness={vibe.happiness} color={dominantColor} />
      )}

      {/* Main Row */}
      <div className="relative z-10 flex items-center gap-3.5 p-3.5 pb-4">
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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1DB954]" />
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
            <span className="mt-0.5 font-medium text-xs text-zinc-500">Not listening to anything</span>
          )}
        </div>

        {/* Status */}
        <div className="shrink-0 flex items-center pl-1">
          {isPlaying ? (
            <Equalizer />
          ) : (
            <SiSpotify className="text-zinc-300 dark:text-zinc-700 group-hover:text-[#1DB954] transition-colors duration-300" size={18} />
          )}
        </div>
      </div>

      {/* Progress bar */}
      {isPlaying && percentage > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-zinc-100 dark:bg-zinc-900 overflow-hidden z-10">
          <div
            className="h-full bg-[#1DB954] transition-all duration-1000 ease-linear"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </a>
  );
};
