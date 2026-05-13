# 🌟 The Nii Dromo — Developer Portfolio

A high-performance, state-of-the-art personal developer portfolio engineered with Next.js, React Server Components, and TailwindCSS. Focused on rich visual aesthetics, robust edge-security, and deep third-party integrations.

---

## 🚀 Major Features & Architecture

### 1. 🎶 Real-Time Spotify Integration Hub
Exposes live analytics and deep statistical aggregates powered directly by the Spotify Web API.
- **Active Now Playing Card**: Seamless client-side polling displaying your live stream, or falling back gracefully to Recently Played status when offline.
- **📊 Vibe Analytics Engine**: Dynamically fetches deep acoustic characteristics (Energy, Groove, and Mood percentages) using Spotify Audio Features to render custom live dashboards.
- **🔐 Secured Music Hub (`/music`)**: A private administrative data visualization center displaying personal charts across customizable time horizons (Short, Medium, & Long-Term).
- **🎛️ Smart "Pass the Aux" DJ Widget**: An interactive client component allowing approved visitors to request tracks and insert them directly into your live playback queue. Hides automatically from the DOM when your player is offline to prevent error logging.

### 2. 🛡️ Next.js Edge Middleware Security
Features a zero-trust authentication perimeter configured at the network edge.
- **Perimeter Blockage**: Active requests to protected resources (such as `/music`) are intercepted and validated inside [src/middleware.ts](file:///c:/Users/micha/Desktop/theniidromo/src/middleware.ts) BEFORE executing core dynamic server code.
- **HMAC Signature Decoupling**: Uses standard Web Crypto APIs (`crypto.subtle`) to decrypt session state instantly without standard Node.js runtime overheads.

---

## ⚙️ Setup & Environment Configuration

To fully enable external integrations, define the following core environmental tokens in your `.env` file:

```env
# 🔑 Core Configuration & Auth
DATABASE_URL="postgresql://..."
SESSION_SECRET="development_secret_key"
NEXT_PUBLIC_ADMIN_USERNAME="theniitettey"

# 🐙 Third-Party Provider Authorization
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# 🎵 Spotify Integrations
SPOTIFY_CLIENT_ID="..."
SPOTIFY_CLIENT_SECRET="..."
SPOTIFY_REFRESH_TOKEN="..."
```

---

## 📂 Content Structure Documentation

Your dynamic text assets are managed via the local markdown definitions. Below are the core document types you can build:

### 1. **Page**

The `Page` type is used for defining static text pages like the homepage or About Me.

#### Fields:
- `title` (required)  
  **Type**: `string` — The page title.
- `description` (optional)  
  **Type**: `string` — A brief summary of the page content.

#### Computed Fields:
- `slug`: Resolves to absolute URL path (e.g. `/about` from `about.mdx`).
- `slugAsParams`: Resolves to raw path parameters used in internal routing.
- `readTimeMinutes`: Automatically computes humanized reading estimates (e.g. `4 min read`).

#### Example:
```mdx
---
title: "About Me"
description: "A little bit about myself."
---

# About Me

Welcome to my portfolio site!
```
