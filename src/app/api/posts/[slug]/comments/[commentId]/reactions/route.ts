import { sql } from "@/lib/db";
import { ensureInteractionsTables } from "@/lib/interactions-db";
import { getSession } from "@/lib/session";
import { NextRequest } from "next/server";
import { createHash } from "crypto";

const ALLOWED_REACTIONS = ["heart", "thumbs_up", "rocket", "celebrate", "insight"];

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
  params: Promise<{ slug: string; commentId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { commentId } = await params;
  await ensureInteractionsTables();

  const id = parseInt(commentId, 10);
  if (isNaN(id)) {
    return Response.json({ error: "Invalid comment ID" }, { status: 400 });
  }

  let body: { reaction?: string } = {};
  try {
    body = await req.json();
  } catch (err) {}

  const reaction = body.reaction ?? "heart";
  if (!ALLOWED_REACTIONS.includes(reaction)) {
    return Response.json({ error: "Invalid reaction type" }, { status: 400 });
  }

  const session = await getSession();
  const anonId = session ? null : hashIp(getClientIp(req));

  if (session) {
    const [existing] = await sql`
      SELECT id, reaction_type FROM comment_reactions WHERE comment_id = ${id} AND github_id = ${session.githubId}
    `;
    if (existing) {
      if (existing.reaction_type === reaction) {
        // Same reaction -> toggle off
        await sql`DELETE FROM comment_reactions WHERE id = ${existing.id}`;
      } else {
        // Different reaction -> update type
        await sql`UPDATE comment_reactions SET reaction_type = ${reaction} WHERE id = ${existing.id}`;
      }
    } else {
      // No reaction -> insert
      await sql`
        INSERT INTO comment_reactions (comment_id, github_id, username, reaction_type)
        VALUES (${id}, ${session.githubId}, ${session.username}, ${reaction})
      `;
    }
  } else {
    const [existing] = await sql`
      SELECT id, reaction_type FROM comment_reactions WHERE comment_id = ${id} AND anon_id = ${anonId}
    `;
    if (existing) {
      if (existing.reaction_type === reaction) {
        await sql`DELETE FROM comment_reactions WHERE id = ${existing.id}`;
      } else {
        await sql`UPDATE comment_reactions SET reaction_type = ${reaction} WHERE id = ${existing.id}`;
      }
    } else {
      await sql`
        INSERT INTO comment_reactions (comment_id, anon_id, reaction_type)
        VALUES (${id}, ${anonId}, ${reaction})
      `;
    }
  }

  // Return aggregated count for this comment
  const counts = await sql`
    SELECT reaction_type, COUNT(*)::integer AS count
    FROM comment_reactions WHERE comment_id = ${id}
    GROUP BY reaction_type
  `;

  const reactionsMap: Record<string, number> = {};
  counts.forEach((r: any) => {
    reactionsMap[r.reaction_type] = r.count;
  });

  return Response.json({ reactionsMap });
}
