# theniidromo.me

so this is the repo for my personal site — [theniidromo.me](https://theniidromo.me). it's a portfolio, a blog, a devotional archive, a music dashboard, a guestbook, and whatever else I decided to add at 2am. it's built with Next.js, TypeScript, and a content pipeline I actually enjoy working with. this README documents it properly so future-me (and anyone else poking around) doesn't have to reverse-engineer everything.

---

## what's actually on this site

- **home** — bio, live time-on-earth counter, now playing, featured projects, recent writing
- **blog** (`/blog`) — longer-form technical and personal writing
- **thoughts** (`/thoughts`) — short-form reflections. the stuff that doesn't need 1500 words
- **asore** (`/asore`) — devotionals. faith, scripture, spiritual reflections
- **guestbook** (`/guestbook`) — sign in with GitHub or Google, leave a message
- **music** (`/music`) — personal Spotify dashboard. top tracks, listening history. admin only
- **resume** (`/resume`) — exactly what it sounds like

---

## stack

| layer | what |
|---|---|
| framework | Next.js 14 — App Router, React Server Components |
| content | Velite — MDX compiled at build time, typed collections |
| styling | Tailwind CSS — custom color tokens, dark mode via class |
| auth | GitHub OAuth + Google OAuth (+ One Tap) + HMAC-signed sessions |
| database | PostgreSQL (Neon) — post views, likes, guestbook entries |
| music | Spotify Web API — now playing, queue injection, top tracks |
| og images | `@vercel/og` (Satori) — edge runtime, per-section routes |
| deployment | Vercel — analytics and speed insights injected at root layout |
| fonts | Geist (body), Dancing Script (logo), system mono |

---

## running it locally

```bash
npm install
npm run dev        # runs velite watch + next dev in parallel
```

other commands:

```bash
npm run build      # velite build + next build
npm run lint       # eslint via next lint
npm run preview    # build + start — local production preview
```

there's no test suite. TypeScript type-checking runs during `next build`.

---

## content

all written content lives in `content/` as MDX files. Velite processes them at build time and generates typed exports into `.velite/` (gitignored). everything re-exports from `src/lib/content.ts`.

### collections

posts, thoughts, and asores all use the same frontmatter shape:

```mdx
---
title: "your title"
description: "optional — shows under the title and in og images"
date: "2026-01-15T10:00:00Z"
tags: ["tag-one", "tag-two"]
draft: false       # true = excluded from all listings
archived: false    # true = moved to the archive
---

your content here
```

the only difference is asores has one extra field:

```mdx
christian: true    # flags the piece as explicitly Christian content
```

**pages** — `content/pages/*.mdx`

static pages. simpler — just `title` and optional `description`, no date or tags.

```mdx
---
title: "page title"
description: "optional"
---

your content here
```

---

### computed fields

every item in every collection gets these automatically:

| field | what it does |
|---|---|
| `slug` | full URL path — e.g. `/posts/my-post` |
| `slugAsParams` | path without the type prefix — e.g. `my-post` |
| `readTimeMinutes` | estimated read time — e.g. `4 min read` |

### MDX features

- **math** — LaTeX via `remark-math` + `rehype-katex`
- **code blocks** — syntax highlighted via `bright` with `github-dark` / `github-light` themes
- **custom components** — `Quote`, headings, paragraphs, lists all have custom renderers via `MDXComponent`

---

## routes

```
/                          home
/blog                      all non-archived posts
/posts/[...slug]           individual post
/thoughts                  all non-archived thoughts
/thoughts/[...slug]        individual thought
/asore                     all non-archived devotionals
/asore/[...slug]           individual devotional
/archive/posts             archived posts
/archive/devotionals       archived devotionals
/guestbook                 guestbook — GitHub auth required to sign
/music                     spotify dashboard — admin only
/resume                    resume

/api/og/profile            og image — home / profile
/api/og/content            og image — posts, thoughts, devotionals (shared route)
/api/og/post-archive       og image — post archive page
/api/og/dev-archive        og image — devotional archive page
/api/og/thought            og image — thoughts index page
```

---

## og images

each section has a corresponding `/api/og/` route running on the edge via `@vercel/og`. they all share the same design — dark grid background (`#161616`), section label, title, description, doodle, site name.

the content routes (posts, thoughts, devotionals) all share a single route at `/api/og/content` and accept query params:

```
?section=blog+post&title=...&description=...&date=...
?section=thoughts&title=...&date=...
?section=devotional&title=...&description=...&date=...
```

---

## features worth knowing about

**Spotify integration**
- `/api/spotify/now-playing` — polls current track, falls back to recently played
- `/api/spotify/top-tracks` — top tracks across short / medium / long term
- DJ widget — lets visitors request songs to the queue. hides itself when the player is offline

**auth + sessions**
- GitHub OAuth via `/api/auth/github` + `/api/auth/github/callback`
- Google OAuth via `/api/auth/google` + `/api/auth/google/callback` — with PKCE and state validation
- Google One Tap via `/api/auth/google/one-tap`
- sessions store a `provider` field (`"github" | "google"`) so both flows share the same session shape
- sessions are signed using HMAC-SHA256 via `crypto.subtle` (Web Crypto API) — cookie is `base64url(payload).base64url(sig)`, verified on every read
- admin access (e.g. `/music`) is checked against `NEXT_PUBLIC_ADMIN_USERNAME`

**post interactions**

views:
- tracked per post via `getPostViews` / `incrementPostViews` on page load

likes:
- progressive fill heart — each user can tap up to 50 times, filling the heart incrementally
- taps are debounced (800ms) before syncing to the server so rapid clicking doesn't hammer the DB
- floating `+1` bubble animation on each tap

comments:
- sign in required — GitHub or Google
- threaded: top-level comments + nested replies
- comment reactions: 👍 ❤️ 🚀 🎉 💡 — floating emoji animation on react, reaction counts shown as pills
- reply reactions work the same way
- delete available to comment owner or admin (`NEXT_PUBLIC_ADMIN_USERNAME`)
- 1000 character limit per comment/reply

**related content**
- `RelatedPosts` component — tag-based, works across any collection (posts or thoughts)
- appears after interactions on individual post and thought pages

---

## environment variables

create a `.env.local` at the root:

```env
# database
DATABASE_URL="postgresql://..."

# auth
SESSION_SECRET="your-secret-here"
NEXT_PUBLIC_ADMIN_USERNAME="theniitettey"

# github oauth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# google oauth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# spotify
SPOTIFY_CLIENT_ID="..."
SPOTIFY_CLIENT_SECRET="..."
SPOTIFY_REFRESH_TOKEN="..."
```

---

## project structure

```
src/
  app/                  pages and layouts (App Router)
    api/                api routes — auth, spotify, og images, interactions
  components/           shared components
    ui/                 motion wrappers, toggles, utility components
  data/
    person.ts           single source of truth for personal info (name, links, etc.)
  lib/
    content.ts          re-exports all velite collections
    config.ts           site config (url, admin, etc.)
    session.ts          session helpers
content/
  posts/
  thoughts/
  asore/
  pages/
velite.config.ts        content pipeline config
```

---

---

## why MDX and not a CMS

honestly? laziness. but like, the principled kind.

the alternative was setting up a CMS — Contentful, Sanity, whatever — which means a dashboard to log into, an API to call, a schema to maintain, and a whole separate system to keep in sync with the code. or I could've just built individual pages for every post, which... no. I'm not doing that. I'd have to create a new file, add a new route, wire up metadata, write the content, and repeat that every single time I wanted to publish something. that is too much work for someone who already finds reasons not to write.

with MDX, I open a file, write, and push. that's the whole workflow. the content pipeline (Velite) picks it up at build time, generates typed exports, handles slugs, computes read time — everything I'd have had to wire up manually is just... there. the frontmatter gives me structured data without a separate database. the MDX gives me full component support inside prose when I need it, which is occasionally and exactly when I need it.

and the part that actually sold me — it's still JSX. I can drop a custom component right inside a piece of writing and it just works. need a styled quote block? there's a `<Quote>` component. want to embed a code snippet with syntax highlighting? `<Code>`. need something more custom — a callout, an interactive widget, whatever — I write the component once and use it anywhere across any piece of content. no shortcodes, no CMS-specific syntax, no plugin to install. just the same React I'm already writing everywhere else. the line between "content" and "code" basically disappears, which is exactly how it should feel.

it also means everything lives in the same repo. content, code, config — one git history, one deployment. if I want to archive a post I change one field. if I want to add a new collection I add 10 lines to `velite.config.ts`. no migration, no API keys, no CMS subscription, no "your free tier limit has been reached."

would a CMS scale better if this were a publication with multiple authors and editors? probably. but it's just me. and I write when I feel like it. the setup should match the person, and this one does.

_if you're reading this and it's your first time here — akwaaba. hope you find something worth reading._
