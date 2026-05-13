import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface SpotifyNowPlaying {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
  disabled?: boolean;
  durationMs?: number;
  progressMs?: number;
  vibe?: {
    energy: number;
    happiness: number;
    groove: number;
  } | null;
}

export function useSpotifyNowPlaying() {
  return useQuery<SpotifyNowPlaying>({
    queryKey: ["spotify-now-playing"],
    queryFn: async () => {
      const { data } = await axios.get<SpotifyNowPlaying>("/api/spotify/now-playing");
      return data;
    },
    refetchInterval: (query) => (query.state.data?.disabled ? false : 5000),
    refetchOnWindowFocus: (query) => !query.state.data?.disabled,
  });
}
