export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://theniidromo.me",
  db: {
    url: process.env.DATABASE_URL || "",
  },
  auth: {
    sessionSecret:
      process.env.SESSION_SECRET ||
      (process.env.NODE_ENV === "production"
        ? (() => { throw new Error("SESSION_SECRET env var is not set") })()
        : "dev_secret_change_me"),
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  admin: {
    username: process.env.NEXT_PUBLIC_ADMIN_USERNAME || process.env.ADMIN_GITHUB_USERNAME || "theniitettey",
  },
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || "",
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
    refreshToken: process.env.SPOTIFY_REFRESH_TOKEN || "",
  },
  isProduction: process.env.NODE_ENV === "production",
};
