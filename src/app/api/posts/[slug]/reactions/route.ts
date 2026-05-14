import { sql } from "@/lib/db";
import { ensureInteractionsTables } from "@/lib/interactions-db";
import { getSession } from "@/lib/session";
import { NextRequest } from "next/server";
import { createHash } from "crypto";

const MAX_LIKES = 50;
const SESSION_SECRET = process.env.SESSION_SECRET;

function hashIp(ip: string) {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET is required for anonymous reactions");
  }
  return createHash("sha256").update(ip + SESSION_SECRET).digest("hex").slice(0, 32);
}

function getClientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

interface RouteParams {
  params: Promise<{ slug: string }>;
}

async function getTotals(slug: string, githubId?: string, anonId?: string | null) {
  const [totalRow] = await sql`
    SELECT COALESCE(SUM(reaction_count), 0) AS total
    FROM post_reactions WHERE post_slug = ${slug}
  `;

  let userCount = 0;
  if (githubId != null) {
    const [row] = await sql`
      SELECT reaction_count FROM post_reactions
      WHERE post_slug = ${slug} AND github_id = ${githubId}
    `;
    userCount = row?.reaction_count ?? 0;
  } else if (anonId) {
    const [row] = await sql`
      SELECT reaction_count FROM post_reactions
      WHERE post_slug = ${slug} AND anon_id = ${anonId}
    `;
    userCount = row?.reaction_count ?? 0;
  }

  return { totalCount: Number(totalRow.total), userCount, maxLikes: MAX_LIKES };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  await ensureInteractionsTables();

  const session = await getSession();
  if (!session && !SESSION_SECRET) {
    return Response.json({ error: "Anonymous reactions unavailable" }, { status: 500 });
  }
  const anonId = session ? null : hashIp(getClientIp(req));

  return Response.json(await getTotals(slug, session?.userId, anonId));
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  await ensureInteractionsTables();

  const session = await getSession();
  if (!session && !SESSION_SECRET) {
    return Response.json({ error: "Anonymous reactions unavailable" }, { status: 500 });
  }
  const anonId = session ? null : hashIp(getClientIp(req));

  const body = await req.json() as { delta?: number };
  const delta = Math.min(Math.max(1, Math.floor(body.delta ?? 1)), MAX_LIKES);

  if (session) {
    await sql`
      INSERT INTO post_reactions (post_slug, github_id, username, reaction_count)
      VALUES (${slug}, ${session.userId}, ${session.username}, ${delta})
      ON CONFLICT (post_slug, github_id) WHERE github_id IS NOT NULL
      DO UPDATE SET reaction_count = LEAST(post_reactions.reaction_count + EXCLUDED.reaction_count, ${MAX_LIKES})
    `;
  } else {
    await sql`
      INSERT INTO post_reactions (post_slug, anon_id, reaction_count)
      VALUES (${slug}, ${anonId}, ${delta})
      ON CONFLICT (post_slug, anon_id) WHERE anon_id IS NOT NULL
      DO UPDATE SET reaction_count = LEAST(post_reactions.reaction_count + EXCLUDED.reaction_count, ${MAX_LIKES})
    `;
  }

  return Response.json(await getTotals(slug, session?.userId, anonId));
}
