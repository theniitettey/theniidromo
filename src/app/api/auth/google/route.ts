import { Google, generateState, generateCodeVerifier } from "arctic";
import { cookies } from "next/headers";

import { siteConfig } from "@/lib/config";

export async function GET(): Promise<Response> {
  const siteUrl = siteConfig.url;
  const google = new Google(
    siteConfig.auth.google.clientId,
    siteConfig.auth.google.clientSecret,
    `${siteUrl}/api/auth/google/callback`
  );

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);

  const cookieStore = await cookies();
  
  // Secure lax cookie for OAuth State
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: siteConfig.isProduction,
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  // Secure PKCE Code Verifier
  cookieStore.set("google_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: siteConfig.isProduction,
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return Response.redirect(url.toString());
}
