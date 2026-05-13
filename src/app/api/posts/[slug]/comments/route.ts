import { sql } from "@/lib/db";
import { ensureInteractionsTables } from "@/lib/interactions-db";
import { getSession } from "@/lib/session";
import { NextRequest } from "next/server";
import { createHash } from "crypto";

function hashIp(ip: string) {
  return createHash("sha256").update(ip + (process.env.SESSION_SECRET || "secret")).digest("hex").slice(0, 32);
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

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  await ensureInteractionsTables();

  const session = await getSession();
  const anonId = session ? null : hashIp(getClientIp(req));
  
  // Identifiers to match likes
  const viewerGithubId = session?.githubId ?? -1;
  const viewerAnonId = anonId ?? "none";

  // Query returns reaction map counts + specific user reaction string
  const comments = await sql`
    SELECT
      c.id, c.github_id, c.username, c.name, c.avatar_url, c.body, c.created_at,
      (
        SELECT COALESCE(json_object_agg(reaction_type, count), '{}') FROM (
          SELECT reaction_type, COUNT(*)::integer AS count
          FROM comment_reactions cr WHERE cr.comment_id = c.id
          GROUP BY reaction_type
        ) t
      ) AS reactions_map,
      (
        SELECT reaction_type FROM comment_reactions cr 
        WHERE cr.comment_id = c.id AND (
          (cr.github_id = ${viewerGithubId} AND ${viewerGithubId} > 0) OR 
          (cr.anon_id = ${viewerAnonId} AND ${viewerAnonId} <> 'none')
        )
        LIMIT 1
      ) AS user_reaction,
      COALESCE(
        json_agg(
          json_build_object(
            'id', r.id,
            'github_id', r.github_id,
            'username', r.username,
            'name', r.name,
            'avatar_url', r.avatar_url,
            'body', r.body,
            'created_at', r.created_at,
            'reactions_map', (
              SELECT COALESCE(json_object_agg(reaction_type, count), '{}') FROM (
                SELECT reaction_type, COUNT(*)::integer AS count
                FROM reply_reactions rr WHERE rr.reply_id = r.id
                GROUP BY reaction_type
              ) t2
            ),
            'user_reaction', (
              SELECT reaction_type FROM reply_reactions rr 
              WHERE rr.reply_id = r.id AND (
                (rr.github_id = ${viewerGithubId} AND ${viewerGithubId} > 0) OR 
                (rr.anon_id = ${viewerAnonId} AND ${viewerAnonId} <> 'none')
              )
              LIMIT 1
            )
          ) ORDER BY r.created_at ASC
        ) FILTER (WHERE r.id IS NOT NULL),
        '[]'
      ) AS replies
    FROM post_comments c
    LEFT JOIN post_replies r ON r.comment_id = c.id
    WHERE c.post_slug = ${slug}
    GROUP BY c.id
    ORDER BY c.created_at ASC
  `;

  return Response.json(comments);
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { body?: string };
  const text = body.body?.trim();

  if (!text || text.length < 1 || text.length > 1000) {
    return Response.json({ error: "Comment must be 1–1000 characters" }, { status: 400 });
  }

  await ensureInteractionsTables();

  const [comment] = await sql`
    INSERT INTO post_comments (post_slug, github_id, username, name, avatar_url, body)
    VALUES (${slug}, ${session.githubId}, ${session.username}, ${session.name}, ${session.avatarUrl}, ${text})
    RETURNING id, github_id, username, name, avatar_url, body, created_at
  `;

  return Response.json({
    ...comment,
    replies: [],
    reactions_map: {},
    user_reaction: null
  }, { status: 201 });
}
