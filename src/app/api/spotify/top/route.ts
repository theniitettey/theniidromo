import { NextRequest, NextResponse } from "next/server";
import { getTopArtists, getTopTracks } from "@/lib/spotify";
import { siteConfig } from "@/lib/config";

// Segment level caching: Cache this route for 1 hour to stay polite with rate limits
export const revalidate = 3600; 

export async function GET(request: NextRequest) {
  // Fail gracefully if unconfigured
  if (
    !siteConfig.spotify.clientId ||
    !siteConfig.spotify.clientSecret ||
    !siteConfig.spotify.refreshToken
  ) {
    return NextResponse.json({ error: "Unconfigured", disabled: true }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "tracks"; // 'tracks' or 'artists'
  const range = searchParams.get("range") || "short_term"; // 'short_term', 'medium_term', 'long_term'

  try {
    let response;
    if (type === "artists") {
      response = await getTopArtists(20, range);
    } else {
      response = await getTopTracks(20, range);
    }

    if (response.status >= 400) {
      const errorData = response.data;
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to fetch top data" },
        { status: response.status }
      );
    }

    const data = response.data;

    if (type === "artists") {
      const artists = (data.items || []).map((artist: any, index: number) => ({
        rank: index + 1,
        name: artist.name,
        imageUrl: artist.images[0]?.url || "",
        url: artist.external_urls.spotify,
        genres: (artist.genres || []).slice(0, 2), // Take first two genres
        followers: artist.followers?.total || 0,
      }));
      return NextResponse.json({ items: artists });
    } else {
      const tracks = (data.items || []).map((track: any, index: number) => ({
        rank: index + 1,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(", "),
        album: track.album.name,
        albumImageUrl: track.album.images[0]?.url || "",
        url: track.external_urls.spotify,
        durationMs: track.duration_ms,
      }));
      return NextResponse.json({ items: tracks });
    }
  } catch (error: any) {
    console.error("Error fetching top lists:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
