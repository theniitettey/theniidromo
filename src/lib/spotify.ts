import { siteConfig } from "@/lib/config";
import axios from "axios";

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

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  try {
    const response = await axios.post(TOKEN_ENDPOINT, params.toString(), {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 5000, // Fail-fast within 5 seconds to prevent route hangs
    });
    return response.data;
  } catch (error: any) {
    // Rethrow compact error to avoid massive Axios stack dumps flooding terminal
    const status = error.response?.status || error.code || "UNKNOWN";
    throw new SpotifyAuthError(`Spotify Token Auth Timeout/Error [${status}]`);
  }
};

// Configure base options for all authenticated requests
const getAuthHeaders = async () => {
  const { access_token } = await getAccessToken();
  return {
    Authorization: `Bearer ${access_token}`,
  };
};

export const getNowPlaying = async () => {
  const headers = await getAuthHeaders();
  return axios.get(NOW_PLAYING_ENDPOINT, {
    headers,
    timeout: 5000,
    validateStatus: () => true, // Pass all statuses to the route handler for manual parsing
  });
};

export const getRecentlyPlayed = async () => {
  const headers = await getAuthHeaders();
  return axios.get(RECENTLY_PLAYED_ENDPOINT, {
    headers,
    timeout: 5000,
    validateStatus: () => true,
  });
};

export const getTopTracks = async (limit = 10, timeRange = "short_term") => {
  const headers = await getAuthHeaders();
  return axios.get(`https://api.spotify.com/v1/me/top/tracks`, {
    params: { limit, time_range: timeRange },
    headers,
    timeout: 5000,
    validateStatus: () => true,
  });
};

export const getTopArtists = async (limit = 10, timeRange = "short_term") => {
  const headers = await getAuthHeaders();
  return axios.get(`https://api.spotify.com/v1/me/top/artists`, {
    params: { limit, time_range: timeRange },
    headers,
    timeout: 5000,
    validateStatus: () => true,
  });
};

export const searchTracks = async (query: string) => {
  const headers = await getAuthHeaders();
  return axios.get(`https://api.spotify.com/v1/search`, {
    params: { q: query, type: "track", limit: 5 },
    headers,
    timeout: 5000,
    validateStatus: () => true,
  });
};

export const addToQueue = async (uri: string) => {
  const headers = await getAuthHeaders();
  return axios.post(`https://api.spotify.com/v1/me/player/queue`, null, {
    params: { uri },
    headers,
    timeout: 5000,
    validateStatus: () => true,
  });
};
