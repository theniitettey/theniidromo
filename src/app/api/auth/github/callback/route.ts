import { GitHub } from "arctic";
import { cookies } from "next/headers";
import { setSession } from "@/lib/session";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest): Promise<Response> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("github_oauth_state")?.value;
  cookieStore.delete("github_oauth_state");

  if (!code || !state || state !== storedState) {
    return Response.redirect(`${siteUrl}/guestbook?error=invalid_state`);
  }

  const github = new GitHub(
    process.env.GITHUB_CLIENT_ID!,
    process.env.GITHUB_CLIENT_SECRET!,
    `${siteUrl}/api/auth/github/callback`
  );

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const accessToken = tokens.accessToken();

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "theniidromo-guestbook",
      },
    });

    if (!userRes.ok) {
      return Response.redirect(`${siteUrl}/guestbook?error=github_api`);
    }

    const user = await userRes.json() as {
      id: number;
      login: string;
      name: string | null;
      avatar_url: string;
    };

    // Fetch verified emails to support cross-provider merging
    let userEmail: string | null = null;
    try {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "theniidromo-guestbook",
        },
      });
      if (emailsRes.ok) {
        const emails = (await emailsRes.json()) as Array<{
          email: string;
          verified: boolean;
          primary: boolean;
        }>;
        const bestEmail = emails.find((e) => e.verified && e.primary) || emails.find((e) => e.verified);
        if (bestEmail) {
          userEmail = bestEmail.email;
        }
      }
    } catch (err) {}

    const { resolveUnifiedUser } = await import("@/lib/interactions-db");
    const canonicalId = await resolveUnifiedUser({
      githubId: String(user.id),
      email: userEmail,
    });

    await setSession({
      githubId: canonicalId,
      username: user.login,
      name: user.name ?? user.login,
      avatarUrl: user.avatar_url,
    });

    return Response.redirect(`${siteUrl}/guestbook`);
  } catch {
    return Response.redirect(`${siteUrl}/guestbook?error=oauth_failed`);
  }
}
