import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { NextRequest } from "next/server";

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS guestbook (
      id SERIAL PRIMARY KEY,
      github_id TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'github',
      username TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  const [githubIdColumn] = await sql`
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'guestbook'
      AND column_name = 'github_id'
  `;
  if (githubIdColumn?.data_type !== "text") {
    await sql`ALTER TABLE guestbook ALTER COLUMN github_id TYPE TEXT`;
  }

  await sql`
    ALTER TABLE guestbook ADD COLUMN IF NOT EXISTS signature_data TEXT;
  `;
  await sql`
    ALTER TABLE guestbook ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'github';
  `;
  await sql`
    ALTER TABLE guestbook ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
  `;
  // Backfill rows where updated_at was never set (existing rows get created_at, not NOW())
  await sql`
    UPDATE guestbook SET updated_at = created_at WHERE updated_at IS NULL;
  `;
  await sql`
    ALTER TABLE guestbook ALTER COLUMN updated_at SET DEFAULT NOW();
  `;
  // Ensure unique constraint exists for UPSERT
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'guestbook_github_id_key'
      ) THEN
        ALTER TABLE guestbook ADD CONSTRAINT guestbook_github_id_key UNIQUE (github_id);
      END IF;
    END $$;
  `;
}

export async function GET() {
  await ensureTable();
  const rows = await sql`
    SELECT id, github_id, username, name, avatar_url, message, signature_data, provider, created_at, updated_at
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
    INSERT INTO guestbook (github_id, username, name, avatar_url, message, signature_data, provider)
    VALUES (${session.userId}, ${session.username}, ${displayName}, ${session.avatarUrl}, ${message}, ${signatureData}, ${session.provider})
    ON CONFLICT (github_id) DO UPDATE SET
      name = EXCLUDED.name,
      message = EXCLUDED.message,
      signature_data = EXCLUDED.signature_data,
      updated_at = NOW()
    -- created_at is intentionally NOT updated
    RETURNING id, github_id, username, name, avatar_url, message, signature_data, provider, created_at, updated_at
  `;

  return Response.json(rows[0], { status: 201 });
}
