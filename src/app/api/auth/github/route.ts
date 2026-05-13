import { GitHub, generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET(): Promise<Response> {
  const github = new GitHub(
    process.env.GITHUB_CLIENT_ID!,
    process.env.GITHUB_CLIENT_SECRET!,
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/github/callback`
  );

  const state = generateState();
  const url = github.createAuthorizationURL(state, ["read:user", "user:email"]);

  const cookieStore = await cookies();
  cookieStore.set("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return Response.redirect(url.toString());
}
