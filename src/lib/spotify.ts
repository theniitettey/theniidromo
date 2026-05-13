import { siteConfig } from "@/lib/config";

const clientId = siteConfig.spotify.clientId;
const clientSecret = siteConfig.spotify.clientSecret;
const refreshToken = siteConfig.spotify.refreshToken;

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const RECENTLY_PLAYED_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played?limit=1`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

export class SpotifyAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpotifyAuthError";
  }
}

const getAccessToken = async () => {
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Spotify environment variables are missing!");
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    next: { revalidate: 0 }, // Next.js 13+ App Router caching directive
  });

  if (!response.ok) {
    throw new SpotifyAuthError(
      `Failed to refresh token (${response.status}): ${response.statusText}`
    );
  }

  return response.json();
};

export const getNowPlaying = async () => {
  const { access_token: accessToken } = await getAccessToken();

  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 },
  });
};

export const getRecentlyPlayed = async () => {
  const { access_token: accessToken } = await getAccessToken();

  return fetch(RECENTLY_PLAYED_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 },
  });
};
