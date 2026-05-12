"use client";
import { SiSpotify } from "react-icons/si";

interface SpotifyCardProps {
  trackId: string;
  label: string;
}

export const SpotifyCard = ({ trackId, label }: SpotifyCardProps) => (
  <div className="rounded-t-xl border border-zinc-800 bg-[#121212]">
    <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
      <span className="text-[10px] font-medium text-zinc-500 tracking-wide">{label}</span>
      <SiSpotify size={10} className="text-[#1DB954]" />
    </div>
    <iframe
      style={{
        display: "block",
        border: "none",
        backgroundColor: "#121212",
        borderRadius: "0 0 11px 11px",
      }}
      src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
      width="100%"
      height="80"
      frameBorder={0}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  </div>
);
