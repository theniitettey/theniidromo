import { NextResponse } from "next/server";
import { getNowPlaying, getRecentlyPlayed, getTrackFeatures } from "@/lib/spotify";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

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
    if (response.status === 204 || response.status > 400) {
      return getFallbackRecentlyPlayed();
    }

    const song = response.data;

    if (!song || !song.item) {
      return getFallbackRecentlyPlayed();
    }

    const isPlaying = song.is_playing;
    const title = song.item.name;
    const artist = song.item.artists.map((_artist: any) => _artist.name).join(", ");
    const album = song.item.album.name;
    const albumImageUrl = song.item.album.images[0]?.url || "";
    const songUrl = song.item.external_urls.spotify;
    
    // Extended metrics
    const durationMs = song.item.duration_ms || 0;
    const progressMs = song.progress_ms || 0;
    
    // Fetch audio features
    let vibe = null;
    try {
      const featureResponse = await getTrackFeatures(song.item.id);
      if (featureResponse.status >= 200 && featureResponse.status < 300) {
        const features = featureResponse.data;
        vibe = {
          energy: Math.round((features.energy || 0) * 100),
          happiness: Math.round((features.valence || 0) * 100),
          groove: Math.round((features.danceability || 0) * 100),
        };
      }
    } catch (e) {
      // Silently fail features so the UI still displays the track
    }

    return NextResponse.json(
      {
        isPlaying,
        title,
        artist,
        album,
        albumImageUrl,
        songUrl,
        durationMs,
        progressMs,
        vibe,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching now-playing from Spotify:", error.message);
    return getFallbackRecentlyPlayed();
  }
}

async function getFallbackRecentlyPlayed() {
  try {
    const response = await getRecentlyPlayed();

    if (response.status >= 400) {
      return NextResponse.json({ isPlaying: false });
    }

    const data = response.data;
    const trackData = data.items?.[0]?.track;

    if (!trackData) {
      return NextResponse.json({ isPlaying: false });
    }

    const title = trackData.name;
    const artist = trackData.artists.map((_artist: any) => _artist.name).join(", ");
    const album = trackData.album.name;
    const albumImageUrl = trackData.album.images[0]?.url || "";
    const songUrl = trackData.external_urls.spotify;

    // Fetch audio features for the fallback track
    let vibe = null;
    try {
      const featureResponse = await getTrackFeatures(trackData.id);
      if (featureResponse.status >= 200 && featureResponse.status < 300) {
        const features = featureResponse.data;
        vibe = {
          energy: Math.round((features.energy || 0) * 100),
          happiness: Math.round((features.valence || 0) * 100),
          groove: Math.round((features.danceability || 0) * 100),
        };
      }
    } catch (e) {
      // Fail silently
    }

    return NextResponse.json(
      {
        isPlaying: false,
        title,
        artist,
        album,
        albumImageUrl,
        songUrl,
        vibe,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching recently-played from Spotify:", error);
    return NextResponse.json({ isPlaying: false });
  }
}
