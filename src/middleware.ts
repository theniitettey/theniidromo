import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "@/lib/session";
import { siteConfig } from "@/lib/config";

export async function middleware(request: NextRequest) {
  const cookieValue = request.cookies.get("gb_session")?.value;
  const session = await decryptSession(cookieValue);

  // Verify admin credentials using edge-compatible cryptographic verifier
  const isAdmin = session && session.username === siteConfig.admin.username;

  if (!isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/"; // Bounce unauthorized users to root index
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Strictly bind middleware to target routes to maintain peak speed for other pages
export const config = {
  matcher: ["/music/:path*"],
};
