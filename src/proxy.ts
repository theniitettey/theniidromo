import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "@/lib/session";
import { siteConfig } from "@/lib/config";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rewrite /auth/:path* → /api/auth/:path* (keeps internal API structure opaque)
  if (pathname.startsWith("/auth/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/api${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Guard /music to admin only
  if (pathname.startsWith("/music")) {
    const cookieValue = request.cookies.get("gb_session")?.value;
    const session = await decryptSession(cookieValue);
    const isAdmin = session && session.username === siteConfig.admin.username;

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/music/:path*"],
};
