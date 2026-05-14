import { sql } from "./db";

let initPromise: Promise<void> | null = null;

export function ensureInteractionsTables(): Promise<void> {
  if (!initPromise) {
    initPromise = _init().catch((err) => {
      // Reset so next request retries
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

async function safeRun(fn: () => Promise<any>) {
  try {
    await fn();
  } catch (err: any) {
    // Swallow 42P07 (duplicate table), 42710 (duplicate object), 23505 (unique constraint during catalog insert race)
    if (err.code === "42P07" || err.code === "42710" || err.code === "23505") {
      return;
    }
    throw err;
  }
}

export interface UserIdentityParams {
  email?: string | null;
  githubId?: string | null;
  googleId?: string | null;
}

export async function resolveUnifiedUser({ email, githubId, googleId }: UserIdentityParams): Promise<string> {
  await ensureInteractionsTables();
  const normalizedEmail = email?.toLowerCase().trim() || null;

  // 1. Try lookup by provider keys
  let existing: any = null;
  if (githubId) {
    const [row] = await sql`SELECT * FROM user_accounts WHERE github_id = ${githubId}`;
    if (row) existing = row;
  }
  if (!existing && googleId) {
    const [row] = await sql`SELECT * FROM user_accounts WHERE google_id = ${googleId}`;
    if (row) existing = row;
  }
  // 2. Fallback to verified email mapping
  if (!existing && normalizedEmail) {
    const [row] = await sql`SELECT * FROM user_accounts WHERE email = ${normalizedEmail}`;
    if (row) existing = row;
  }

  // 3. If account exists, update missing attributes atomically (link accounts)
  if (existing) {
    let needsUpdate = false;
    let targetGithubId = existing.github_id;
    let targetGoogleId = existing.google_id;
    let targetEmail = existing.email;

    if (githubId && !existing.github_id) {
      targetGithubId = githubId;
      needsUpdate = true;
    }
    if (googleId && !existing.google_id) {
      targetGoogleId = googleId;
      needsUpdate = true;
    }
    if (normalizedEmail && !existing.email) {
      targetEmail = normalizedEmail;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await sql`
        UPDATE user_accounts
        SET github_id = ${targetGithubId}, google_id = ${targetGoogleId}, email = ${targetEmail}, updated_at = NOW()
        WHERE id = ${existing.id}
      `;
    }
    return existing.id;
  }

  // 4. Create new profile with provider-namespaced canonical ID to prevent cross-provider collisions.
  const providerIdPattern = /^[A-Za-z0-9]+$/;
  let canonicalId: string;
  if (githubId) {
    if (!providerIdPattern.test(githubId)) {
      throw new Error("resolveUnifiedUser: githubId must contain only alphanumeric characters");
    }
    canonicalId = `github:${githubId}`;
  } else if (googleId) {
    if (!providerIdPattern.test(googleId)) {
      throw new Error("resolveUnifiedUser: googleId must contain only alphanumeric characters");
    }
    canonicalId = `google:${googleId}`;
  } else {
    throw new Error("resolveUnifiedUser: at least one provider ID is required");
  }

  await safeRun(() => sql`
    INSERT INTO user_accounts (id, email, github_id, google_id)
    VALUES (${canonicalId}, ${normalizedEmail}, ${githubId || null}, ${googleId || null})
    ON CONFLICT DO NOTHING
  `);

  // Query back just in case of insert race
  if (githubId) {
    const [row] = await sql`SELECT id FROM user_accounts WHERE github_id = ${githubId}`;
    if (row) return row.id;
  }
  if (googleId) {
    const [row] = await sql`SELECT id FROM user_accounts WHERE google_id = ${googleId}`;
    if (row) return row.id;
  }
  if (normalizedEmail) {
    const [row] = await sql`SELECT id FROM user_accounts WHERE email = ${normalizedEmail}`;
    if (row) return row.id;
  }

  return canonicalId;
}

async function _init() {
  // Central Identity Hub
  await safeRun(() => sql`
    CREATE TABLE IF NOT EXISTS user_accounts (
      id          TEXT PRIMARY KEY,
      email       TEXT UNIQUE,
      github_id   TEXT UNIQUE,
      google_id   TEXT UNIQUE,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await safeRun(() => sql`
    CREATE TABLE IF NOT EXISTS post_reactions (
      id         SERIAL PRIMARY KEY,
      post_slug  TEXT NOT NULL,
      github_id  TEXT,
      username   TEXT,
      anon_id    TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await safeRun(() => sql`
    CREATE UNIQUE INDEX IF NOT EXISTS post_reactions_auth_unique
    ON post_reactions (post_slug, github_id)
    WHERE github_id IS NOT NULL
  `);

  await safeRun(() => sql`
    CREATE UNIQUE INDEX IF NOT EXISTS post_reactions_anon_unique
    ON post_reactions (post_slug, anon_id)
    WHERE anon_id IS NOT NULL
  `);

  await safeRun(() => sql`
    ALTER TABLE post_reactions ADD COLUMN IF NOT EXISTS reaction_count INTEGER NOT NULL DEFAULT 1
  `);

  await safeRun(() => sql`
    CREATE TABLE IF NOT EXISTS post_comments (
      id         SERIAL PRIMARY KEY,
      post_slug  TEXT NOT NULL,
      github_id  TEXT NOT NULL,
      username   TEXT NOT NULL,
      name       TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      body       TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await safeRun(() => sql`
    CREATE TABLE IF NOT EXISTS post_replies (
      id         SERIAL PRIMARY KEY,
      comment_id INTEGER NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
      github_id  TEXT NOT NULL,
      username   TEXT NOT NULL,
      name       TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      body       TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Comment reactions
  await safeRun(() => sql`
    CREATE TABLE IF NOT EXISTS comment_reactions (
      id         SERIAL PRIMARY KEY,
      comment_id INTEGER NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
      github_id  TEXT,
      username   TEXT,
      anon_id    TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await safeRun(() => sql`
    CREATE UNIQUE INDEX IF NOT EXISTS comment_reactions_auth_unique
    ON comment_reactions (comment_id, github_id)
    WHERE github_id IS NOT NULL
  `);

  await safeRun(() => sql`
    CREATE UNIQUE INDEX IF NOT EXISTS comment_reactions_anon_unique
    ON comment_reactions (comment_id, anon_id)
    WHERE anon_id IS NOT NULL
  `);

  await safeRun(() => sql`
    ALTER TABLE comment_reactions ADD COLUMN IF NOT EXISTS reaction_type TEXT NOT NULL DEFAULT 'heart'
  `);

  // Reply reactions
  await safeRun(() => sql`
    CREATE TABLE IF NOT EXISTS reply_reactions (
      id         SERIAL PRIMARY KEY,
      reply_id   INTEGER NOT NULL REFERENCES post_replies(id) ON DELETE CASCADE,
      github_id  TEXT,
      username   TEXT,
      anon_id    TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await safeRun(() => sql`
    CREATE UNIQUE INDEX IF NOT EXISTS reply_reactions_auth_unique
    ON reply_reactions (reply_id, github_id)
    WHERE github_id IS NOT NULL
  `);

  await safeRun(() => sql`
    CREATE UNIQUE INDEX IF NOT EXISTS reply_reactions_anon_unique
    ON reply_reactions (reply_id, anon_id)
    WHERE anon_id IS NOT NULL
  `);

  await safeRun(() => sql`
    ALTER TABLE reply_reactions ADD COLUMN IF NOT EXISTS reaction_type TEXT NOT NULL DEFAULT 'heart'
  `);

  // MIGRATIONS: Add provider column to comments and replies
  await safeRun(() => sql`
    ALTER TABLE post_comments ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'github'
  `);
  await safeRun(() => sql`
    ALTER TABLE post_replies ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'github'
  `);

  // MIGRATIONS: Safely alter all existing github_id columns from INTEGER to TEXT
  await safeRun(() => sql`
    ALTER TABLE post_reactions ALTER COLUMN github_id TYPE TEXT
  `);
  await safeRun(() => sql`
    ALTER TABLE post_comments ALTER COLUMN github_id TYPE TEXT
  `);
  await safeRun(() => sql`
    ALTER TABLE post_replies ALTER COLUMN github_id TYPE TEXT
  `);
  await safeRun(() => sql`
    ALTER TABLE comment_reactions ALTER COLUMN github_id TYPE TEXT
  `);
  await safeRun(() => sql`
    ALTER TABLE reply_reactions ALTER COLUMN github_id TYPE TEXT
  `);

  await safeRun(() => sql`
    CREATE TABLE IF NOT EXISTS post_views (
      slug TEXT PRIMARY KEY,
      count BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function incrementPostView(slug: string): Promise<number> {
  await ensureInteractionsTables();
  const rows = await sql`
    INSERT INTO post_views (slug, count, updated_at)
    VALUES (${slug}, 1, NOW())
    ON CONFLICT (slug) DO UPDATE
      SET count = post_views.count + 1,
          updated_at = NOW()
    RETURNING count
  `;
  return Number(rows[0].count);
}

export async function getPostViews(slug: string): Promise<number> {
  await ensureInteractionsTables();
  const rows = await sql`SELECT count FROM post_views WHERE slug = ${slug}`;
  return rows.length > 0 ? Number(rows[0].count) : 0;
}
