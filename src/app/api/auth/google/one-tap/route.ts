import { NextRequest } from "next/server";
import { setSession } from "@/lib/session";
import { resolveUnifiedUser } from "@/lib/interactions-db";
import { siteConfig } from "@/lib/config";

interface GoogleTokenInfo {
  sub: string;
  email?: string;
  email_verified?: string;
  name: string;
  picture: string;
  aud: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { credential?: string };
  const { credential } = body;

  if (!credential) {
    return Response.json({ error: "Missing credential" }, { status: 400 });
  }

  const tokenRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
  );

  if (!tokenRes.ok) {
    return Response.json({ error: "Invalid credential" }, { status: 401 });
  }

  const info = await tokenRes.json() as GoogleTokenInfo;

  if (info.aud !== siteConfig.auth.google.clientId) {
    return Response.json({ error: "Token audience mismatch" }, { status: 401 });
  }

  const derivedUsername = info.email
    ? info.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") || "google_user"
    : info.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "") || "google_user";

  const canonicalId = await resolveUnifiedUser({
    googleId: info.sub,
    email: info.email ?? null,
  });

  await setSession({
    userId: canonicalId,
    username: derivedUsername,
    name: info.name || derivedUsername,
    avatarUrl: info.picture,
    provider: "google",
  });

  return Response.json({ ok: true });
}
