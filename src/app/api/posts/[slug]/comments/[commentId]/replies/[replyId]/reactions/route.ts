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
  params: Promise<{ slug: string; commentId: string; replyId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { replyId } = await params;
  await ensureInteractionsTables();

  const id = parseInt(replyId, 10);
  if (isNaN(id)) {
    return Response.json({ error: "Invalid reply ID" }, { status: 400 });
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
      SELECT id, reaction_type FROM reply_reactions WHERE reply_id = ${id} AND github_id = ${session.githubId}
    `;
    if (existing) {
      if (existing.reaction_type === reaction) {
        await sql`DELETE FROM reply_reactions WHERE id = ${existing.id}`;
      } else {
        await sql`UPDATE reply_reactions SET reaction_type = ${reaction} WHERE id = ${existing.id}`;
      }
    } else {
      await sql`
        INSERT INTO reply_reactions (reply_id, github_id, username, reaction_type)
        VALUES (${id}, ${session.githubId}, ${session.username}, ${reaction})
      `;
    }
  } else {
    const [existing] = await sql`
      SELECT id, reaction_type FROM reply_reactions WHERE reply_id = ${id} AND anon_id = ${anonId}
    `;
    if (existing) {
      if (existing.reaction_type === reaction) {
        await sql`DELETE FROM reply_reactions WHERE id = ${existing.id}`;
      } else {
        await sql`UPDATE reply_reactions SET reaction_type = ${reaction} WHERE id = ${existing.id}`;
      }
    } else {
      await sql`
        INSERT INTO reply_reactions (reply_id, anon_id, reaction_type)
        VALUES (${id}, ${anonId}, ${reaction})
      `;
    }
  }

  // Return aggregate counts for this reply
  const counts = await sql`
    SELECT reaction_type, COUNT(*)::integer AS count
    FROM reply_reactions WHERE reply_id = ${id}
    GROUP BY reaction_type
  `;

  const reactionsMap: Record<string, number> = {};
  counts.forEach((r: any) => {
    reactionsMap[r.reaction_type] = r.count;
  });

  return Response.json({ reactionsMap });
}
