import { sql } from "@/lib/db";
import { ensureInteractionsTables } from "@/lib/interactions-db";
import { getSession } from "@/lib/session";
import { NextRequest } from "next/server";
import { siteConfig } from "@/lib/config";

interface RouteParams {
  params: Promise<{ slug: string; commentId: string }>;
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { commentId } = await params;
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = parseInt(commentId, 10);
  if (isNaN(id)) {
    return Response.json({ error: "Invalid comment ID" }, { status: 400 });
  }

  await ensureInteractionsTables();

  const [comment] = await sql`
    SELECT github_id FROM post_comments WHERE id = ${id}
  `;

  if (!comment) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const adminUsername = siteConfig.admin.username;
  const isAdmin = session.username === adminUsername;
  const isOwner = comment.github_id === session.userId;

  if (!isOwner && !isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Replies cascade via FK
  await sql`DELETE FROM post_comments WHERE id = ${id}`;

  return Response.json({ ok: true });
}
