import { cookies } from "next/headers";
import { siteConfig } from "./config";

const SESSION_COOKIE = "gb_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  githubId: string;
  username: string;
  name: string;
  avatarUrl: string;
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Buffer.from(sig).toString("base64url");
}

async function verify(payload: string, sig: string, secret: string): Promise<boolean> {
  const expected = await sign(payload, secret);
  return expected === sig;
}

export async function setSession(data: SessionData): Promise<void> {
  const secret = siteConfig.auth.sessionSecret;
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = await sign(payload, secret);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${payload}.${sig}`, {
    httpOnly: true,
    secure: siteConfig.isProduction,
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function decryptSession(raw: string | undefined): Promise<SessionData | null> {
  const secret = siteConfig.auth.sessionSecret;
  if (!secret || !raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot === -1) return null;
  const payload = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!(await verify(payload, sig, secret))) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionData;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  return decryptSession(raw);
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
