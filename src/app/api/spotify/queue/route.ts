import { NextRequest, NextResponse } from "next/server";
import { addToQueue } from "@/lib/spotify";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

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
