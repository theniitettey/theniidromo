"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuSearch, LuMusic, LuPlus, LuLoader } from "react-icons/lu";
import { useSpotifyNowPlaying } from "@/hooks/useSpotify";
import axios from "axios";
import { toast } from "sonner";
import Image from "next/image";

interface TrackResult {
  id: string;
  title: string;
  artist: string;
  albumImageUrl: string;
  uri: string;
}

export const DjQueueWidget = () => {
  const { data: statusData } = useSpotifyNowPlaying();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TrackResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isQueuing, setIsQueuing] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);


  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search API trigger
  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmed = query.trim();
      if (trimmed.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await axios.get<{ tracks: TrackResult[] }>(
          `/api/spotify/search?q=${encodeURIComponent(trimmed)}`
        );
        setResults(data.tracks || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleQueueTrack = async (track: TrackResult) => {
    setIsQueuing(track.id);
    const toastId = toast.loading(`Adding "${track.title}" to Michael's queue...`);

    try {
      const response = await axios.post("/api/spotify/queue", { uri: track.uri });
      
      if (response.data.success) {
        toast.success(`Successfully added! "${track.title}" will play next.`, {
          id: toastId,
          description: `${track.artist}`,
        });
        // Clean up input
        setQuery("");
        setShowDropdown(false);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to queue song. Verify active player!";
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsQueuing(null);
    }
  };

  // Hide widget entirely if Spotify variables are missing or if Michael is not currently listening
  // Placed here AFTER all hooks to strictly adhere to React's Rules of Hooks and prevent order shifts.
  if (statusData?.disabled || !statusData?.isPlaying) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 mt-1.5 relative" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
          <LuMusic size={11} className="text-[#1DB954]" />
          Pass the Aux (DJ Request)
        </h3>
      </div>

      <div className="relative">
        <div className="flex items-center w-full bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 focus-within:border-zinc-300 dark:focus-within:border-zinc-600 transition-colors rounded-xl pl-3.5 pr-2 overflow-hidden">
          <LuSearch className="text-zinc-400 shrink-0" size={14} />
          <input
            type="text"
            placeholder="Search any track to play on Michael's Spotify..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim().length > 0) setShowDropdown(true);
            }}
            onFocus={() => {
              if (results.length > 0) setShowDropdown(true);
            }}
            className="w-full py-3 px-2.5 bg-transparent border-none outline-none text-xs font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 placeholder:font-normal"
          />
          {loading && (
            <LuLoader size={14} className="text-zinc-400 animate-spin shrink-0" />
          )}
        </div>

        <AnimatePresence>
          {showDropdown && (results.length > 0 || (query.trim().length >= 2 && !loading && results.length === 0)) && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 4, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[280px] overflow-y-auto"
            >
              {results.length > 0 ? (
                results.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => handleQueueTrack(track)}
                    disabled={!!isQueuing}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-zinc-50 dark:hover:bg-[#222] transition-colors disabled:opacity-50 group cursor-pointer"
                  >
                    <div className="relative w-9 h-9 rounded overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-900">
                      {track.albumImageUrl ? (
                        <Image
                          src={track.albumImageUrl}
                          alt=""
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <LuMusic size={14} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-snug group-hover:text-[#1DB954] transition-colors">
                        {track.title}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {track.artist}
                      </span>
                    </div>
                    <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 group-hover:text-white group-hover:bg-[#1DB954] transition-all">
                      {isQueuing === track.id ? (
                        <LuLoader size={12} className="animate-spin text-current" />
                      ) : (
                        <LuPlus size={12} className="text-current" />
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-5 text-center flex flex-col items-center justify-center gap-1.5">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    No matching tracks found
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Try checking the spelling or searching by artist
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
