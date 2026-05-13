import { Google, generateState, generateCodeVerifier } from "arctic";
import { cookies } from "next/headers";

export async function GET(): Promise<Response> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const google = new Google(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${siteUrl}/api/auth/google/callback`
  );

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);

  const cookieStore = await cookies();
  
  // Secure lax cookie for OAuth State
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  // Secure PKCE Code Verifier
  cookieStore.set("google_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return Response.redirect(url.toString());
}
