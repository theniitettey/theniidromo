import { NextRequest, NextResponse } from "next/server";
import { addToQueue, getQueue } from "@/lib/spotify";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  // Fail silently if unconfigured
  if (
    !siteConfig.spotify.clientId ||
    !siteConfig.spotify.clientSecret ||
    !siteConfig.spotify.refreshToken
  ) {
    return NextResponse.json({ error: "Unconfigured" }, { status: 503 });
  }

  try {
    const response = await getQueue();

    if (response.status === 204 || response.status === 404) {
      return NextResponse.json({ queue: [] });
    }

    if (response.status >= 400) {
      const errorData = response.data;
      return NextResponse.json(
        { error: errorData?.error?.message || "Failed to fetch queue" },
        { status: response.status }
      );
    }

    const data = response.data;
    const rawQueue = data.queue || [];

    // Return only the next 5 tracks with simplified metadata to keep it clean
    const queue = rawQueue.slice(0, 5).map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map((a: any) => a.name).join(", "),
      albumImageUrl: track.album?.images[track.album.images.length - 1]?.url || "",
      durationMs: track.duration_ms,
      uri: track.uri,
    }));

    return NextResponse.json({ queue });
  } catch (error) {
    console.error("Error loading playback queue:", error);
    return NextResponse.json({ queue: [] }); // Fail gracefully
  }
}

export async function POST(request: NextRequest) {
  // Fail silently if unconfigured
  if (
    !siteConfig.spotify.clientId ||
    !siteConfig.spotify.clientSecret ||
    !siteConfig.spotify.refreshToken
  ) {
    return NextResponse.json({ error: "Unconfigured" }, { status: 503 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const uri = body.uri;

    if (!uri) {
      return NextResponse.json({ error: "Track URI is required" }, { status: 400 });
    }

    const response = await addToQueue(uri);

    // Handle 404 specifically: Spotify returns 404 when there's no active playback device
    if (response.status === 404) {
      return NextResponse.json(
        { error: "Michael does not have an active Spotify player running. Try again later!" },
        { status: 404 }
      );
    }

    if (response.status === 403) {
      return NextResponse.json(
        { error: "Permission error (Token lacks user-modify-playback-state scope or is unverified)." },
        { status: 403 }
      );
    }

    if (response.status >= 400) {
      const errorBody = response.data;
      return NextResponse.json(
        { error: errorBody?.error?.message || "Could not add song to queue" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error adding to queue:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
