import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { NextRequest } from "next/server";

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS guestbook (
      id SERIAL PRIMARY KEY,
      github_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    ALTER TABLE guestbook ADD COLUMN IF NOT EXISTS signature_data TEXT;
  `;
}

export async function GET() {
  await ensureTable();
  const rows = await sql`
    SELECT id, username, name, avatar_url, message, signature_data, created_at
    FROM guestbook
    ORDER BY created_at DESC
    LIMIT 100
  `;
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { message?: string; signatureData?: string; name?: string };
  const message = body.message?.trim();
  const signatureData = body.signatureData?.trim() || null;
  const displayName = body.name?.trim() || session.name;
  
  if (!message || message.length < 1 || message.length > 500) {
    return Response.json({ error: "Message must be 1–500 characters" }, { status: 400 });
  }

  await ensureTable();

  const rows = await sql`
    INSERT INTO guestbook (github_id, username, name, avatar_url, message, signature_data)
    VALUES (${session.githubId}, ${session.username}, ${displayName}, ${session.avatarUrl}, ${message}, ${signatureData})
    RETURNING id, username, name, avatar_url, message, signature_data, created_at
  `;

  return Response.json(rows[0], { status: 201 });
}
