import { GitHub, generateState } from "arctic";
import { cookies } from "next/headers";

import { siteConfig } from "@/lib/config";

export async function GET(): Promise<Response> {
  const github = new GitHub(
    siteConfig.auth.github.clientId,
    siteConfig.auth.github.clientSecret,
    `${siteConfig.url}/api/auth/github/callback`
  );

  const state = generateState();
  const url = github.createAuthorizationURL(state, ["read:user", "user:email"]);

  const cookieStore = await cookies();
  cookieStore.set("github_oauth_state", state, {
    httpOnly: true,
    secure: siteConfig.isProduction,
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return Response.redirect(url.toString());
}
