import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ slug: string; commentId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { commentId } = await params;
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = parseInt(commentId, 10);
  if (isNaN(id)) {
    return Response.json({ error: "Invalid comment ID" }, { status: 400 });
  }

  const body = await req.json() as { body?: string };
  const text = body.body?.trim();

  if (!text || text.length < 1 || text.length > 1000) {
    return Response.json({ error: "Reply must be 1–1000 characters" }, { status: 400 });
  }

  // Ensure parent comment exists
  const [parent] = await sql`SELECT id FROM post_comments WHERE id = ${id}`;
  if (!parent) {
    return Response.json({ error: "Parent comment not found" }, { status: 404 });
  }

  const [reply] = await sql`
    INSERT INTO post_replies (comment_id, github_id, username, name, avatar_url, body)
    VALUES (${id}, ${session.githubId}, ${session.username}, ${session.name}, ${session.avatarUrl}, ${text})
    RETURNING id, github_id, username, name, avatar_url, body, created_at
  `;

  return Response.json(reply, { status: 201 });
}
