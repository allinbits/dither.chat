# Dynamic OG Meta & Image Generation - Implementation Plan

## Goal
Enable dynamic social media previews for posts so bots (Telegram/Discord) see actual post content instead of generic meta tags.

## Approach
Based on [gno playground implementation](https://github.com/gnostudio/studio/commit/6127ecd15ecb8b55f39ce8b4a8bcf9326ecd0641), use Netlify Edge Functions to:
1. Serve dynamic HTML with OG meta tags for `/post/*` routes
2. Generate 1200×630 OG images for `/og-image/*` routes

## Implementation Steps

### 1. Create Edge Function Structure
**Location**: Root level (where `netlify.toml` is located)
```
netlify/
  edge-functions/
    post-meta.ts      # Dynamic HTML with OG meta
    og-image.ts       # OG image generation
```

### 2. Implement `post-meta.ts`
- Extract post hash from URL path (`/post/:hash`)
- Fetch post from PostgreSQL using Deno-compatible client
- Read `packages/frontend-main/index.html` template
- Replace static meta tags with dynamic values:
  - `og:title` → Post author + message preview
  - `og:description` → Post message (truncated)
  - `og:image` → `/og-image/{hash}`
  - `og:url` → `https://dither.chat/post/{hash}`
- Return HTML for bots

### 3. Implement `og-image.ts`
- Extract post hash from URL path (`/og-image/:hash`)
- Fetch post from PostgreSQL
- Generate 1200×630 image using Satori:
  - Author address
  - Post message (truncated)
  - Timestamp
  - dither.chat branding
- Return PNG image

### 4. Update `netlify.toml`
```toml
[[edge_functions]]
function = "post-meta"
path = "/post/*"

[[edge_functions]]
function = "og-image"
path = "/og-image/*"
```

### 5. Dependencies & Configuration
- **Runtime**: Deno (Netlify Edge Functions)
- **PostgreSQL**: Use Deno-compatible client (`postgres` or `@deno/postgres`)
- **Image Generation**: `satori` (Deno-compatible version)
- **Environment Variables**: Set `PG_URI` in Netlify dashboard
- **Database Access**: Edge Functions connect directly to PostgreSQL (not through api-main)

## Notes
- Frontend SPA meta updates remain for users (client-side)
- Bots use Edge-rendered meta (no JS execution)
- Keep existing `index.html` as template base

