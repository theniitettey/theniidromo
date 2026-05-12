"use client";
import { SiSpotify } from "react-icons/si";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface SpotifyCardProps {
  trackId: string;
  label: string;
}

export const SpotifyCard = ({ trackId, label }: SpotifyCardProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] overflow-hidden">
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <span className="text-[10px] font-medium text-zinc-500 tracking-wide">
          {label}
        </span>
        <SiSpotify size={10} className="text-[#1DB954]" />
      </div>
      {mounted ? (
        <iframe
          style={{
            display: "block",
            border: "none",
            borderRadius: "12px",
            backgroundColor: "transparent",
            colorScheme: isDark ? "dark" : "light",
            clipPath: "inset(1px round 12px)",
          }}
          src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=${isDark ? "0" : "1"}`}
          width="100%"
          height="80"
          frameBorder={0}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      ) : (
        <div style={{ width: "100%", height: "80px" }} />
      )}
    </div>
  );
};
