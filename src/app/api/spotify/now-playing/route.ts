import { NextResponse } from "next/server";
import { getNowPlaying, getRecentlyPlayed } from "@/lib/spotify";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

function isSpotifyAuthError(error: unknown) {
  return error instanceof Error && error.message.includes("SPOTIFY_AUTH_ERROR:");
}

export async function GET() {
  // If credentials are not configured, fail gracefully and disable the feature
  if (
    !siteConfig.spotify.clientId ||
    !siteConfig.spotify.clientSecret ||
    !siteConfig.spotify.refreshToken
  ) {
    return NextResponse.json({ isPlaying: false, disabled: true });
  }

  try {
    // 1. Try to get what's playing right now
    const response = await getNowPlaying();

    // 204 No Content means no music is currently playing, or the account is offline.
    if (response.status === 204 || !response.ok) {
      return getFallbackRecentlyPlayed();
    }

    const song = await response.json();

    if (!song || !song.item) {
      return getFallbackRecentlyPlayed();
    }

    const isPlaying = song.is_playing;
    const title = song.item.name;
    const artist = song.item.artists.map((_artist: any) => _artist.name).join(", ");
    const album = song.item.album.name;
    const albumImageUrl = song.item.album.images[0]?.url || "";
    const songUrl = song.item.external_urls.spotify;

    return NextResponse.json(
      {
        isPlaying,
        title,
        artist,
        album,
        albumImageUrl,
        songUrl,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching now-playing from Spotify:", error.message);

    if (isSpotifyAuthError(error)) {
      return NextResponse.json({ isPlaying: false, disabled: true });
    }

    return getFallbackRecentlyPlayed();
  }
}

async function getFallbackRecentlyPlayed() {
  try {
    const response = await getRecentlyPlayed();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ isPlaying: false, disabled: true });
      }

      return NextResponse.json({ isPlaying: false });
    }

    const data = await response.json();
    const trackData = data.items?.[0]?.track;

    if (!trackData) {
      return NextResponse.json({ isPlaying: false });
    }

    const title = trackData.name;
    const artist = trackData.artists.map((_artist: any) => _artist.name).join(", ");
    const album = trackData.album.name;
    const albumImageUrl = trackData.album.images[0]?.url || "";
    const songUrl = trackData.external_urls.spotify;

    return NextResponse.json(
      {
        isPlaying: false,
        title,
        artist,
        album,
        albumImageUrl,
        songUrl,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching recently-played from Spotify:", error);

    if (isSpotifyAuthError(error)) {
      return NextResponse.json({ isPlaying: false, disabled: true });
    }

    return NextResponse.json({ isPlaying: false });
  }
}
