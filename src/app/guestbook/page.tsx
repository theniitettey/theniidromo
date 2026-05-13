import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { GuestbookClient } from "./GuestbookClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guestbook | The Nii Dromo",
  description: "Leave a message for Nii Dromo.",
};

interface Entry {
  id: number;
  github_id: string;
  username: string;
  name: string;
  avatar_url: string;
  message: string;
  signature_data: string | null;
  created_at: string;
  updated_at: string | null;
}

async function getEntries(): Promise<Entry[]> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS guestbook (
        id SERIAL PRIMARY KEY,
        github_id TEXT NOT NULL,
        username TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar_url TEXT NOT NULL,
        message TEXT NOT NULL,
        signature_data TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    
    // Safe idempotent column alteration
    try {
      await sql`ALTER TABLE guestbook ALTER COLUMN github_id TYPE TEXT`;
    } catch (err) {}

    const rows = await sql`
      SELECT id, github_id, username, name, avatar_url, message, signature_data, created_at, updated_at
      FROM guestbook
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return rows as Entry[];
  } catch {
    return [];
  }
}

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function GuestbookPage({ searchParams }: PageProps) {
  const [entries, session, params] = await Promise.all([
    getEntries(),
    getSession(),
    searchParams,
  ]);

  return (
    <GuestbookClient
      initialEntries={entries}
      session={session}
      error={params.error}
    />
  );
}
