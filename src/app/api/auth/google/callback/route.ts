import { Google } from "arctic";
import { cookies } from "next/headers";
import { setSession } from "@/lib/session";
import { NextRequest } from "next/server";

interface GoogleUser {
  sub: string;
  name: string;
  picture: string;
  email?: string;
}

export async function GET(req: NextRequest): Promise<Response> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value;

  // Clean up auth cookies
  cookieStore.delete("google_oauth_state");
  cookieStore.delete("google_code_verifier");

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    return Response.redirect(`${siteUrl}/guestbook?error=invalid_state`);
  }

  const google = new Google(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${siteUrl}/api/auth/google/callback`
  );

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    // Fetch user info from userinfo endpoint
    const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userRes.ok) {
      return Response.redirect(`${siteUrl}/guestbook?error=google_api`);
    }

    const user = await userRes.json() as GoogleUser;

    // Deriving a readable fallback username from their email or name
    let derivedUsername = "user";
    if (user.email) {
      derivedUsername = user.email.split("@")[0];
    } else if (user.name) {
      derivedUsername = user.name.toLowerCase().replace(/\s+/g, "_");
    }
    // Ensure it is clean ASCII alphanumeric/underscore
    derivedUsername = derivedUsername.replace(/[^a-zA-Z0-9_]/g, "") || "google_user";

    const { resolveUnifiedUser } = await import("@/lib/interactions-db");
    const canonicalId = await resolveUnifiedUser({
      googleId: user.sub,
      email: user.email || null,
    });

    await setSession({
      githubId: canonicalId,
      username: derivedUsername,
      name: user.name || derivedUsername,
      avatarUrl: user.picture,
    });

    return Response.redirect(`${siteUrl}/guestbook`);
  } catch (err) {
    return Response.redirect(`${siteUrl}/guestbook?error=oauth_failed`);
  }
}
