import { NextRequest, NextResponse } from "next/server";
import { searchTracks } from "@/lib/spotify";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Fail silently if unconfigured
  if (
    !siteConfig.spotify.clientId ||
    !siteConfig.spotify.clientSecret ||
    !siteConfig.spotify.refreshToken
  ) {
    return NextResponse.json({ error: "Unconfigured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim() === "") {
    return NextResponse.json({ tracks: [] });
  }

  try {
    const response = await searchTracks(query);

    if (response.status >= 400) {
      const errorData = response.data;
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to search Spotify" },
        { status: response.status }
      );
    }

    const data = response.data;
    const tracks = (data.tracks?.items || []).map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map((a: any) => a.name).join(", "),
      albumImageUrl: track.album.images[track.album.images.length - 1]?.url || "", // Smallest image for search autocomplete list
      uri: track.uri,
    }));

    return NextResponse.json({ tracks });
  } catch (error: any) {
    console.error("Error searching tracks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
