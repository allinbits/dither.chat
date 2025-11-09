# Netlify Edge Functions

Edge functions for dynamic OG meta tags and image generation.

## Functions

### `post-meta.ts`

Handles `/post/*` routes and returns dynamic HTML with OG meta tags based on post content.

**Features:**

- Fetches post from API (`/v1/post?hash={hash}`)
- Injects dynamic meta tags (og:title, og:description, og:image, etc.)
- Returns HTML for bots (Telegram, Discord, etc.)

### `og-image.ts`

Handles `/og-image/*` routes and generates 1200×630 PNG images for social media previews.

**Features:**

- Fetches post from API (`/v1/post?hash={hash}`)
- Generates image using Satori
- Returns PNG with post author, message, and timestamp

## Environment Variables

Set `API_ROOT` in Netlify dashboard:

```
API_ROOT=https://api.dither.chat/v1
```

The edge functions call the API to fetch post data instead of querying PostgreSQL directly.

## Dependencies

- `esm.sh/satori` - SVG generation
- `esm.sh/@resvg/resvg-js` - SVG to PNG conversion

## Testing

Test locally with Netlify CLI:

```bash
netlify dev
```

Then visit:

- `http://localhost:8888/post/{hash}` - Dynamic HTML with meta tags
- `http://localhost:8888/og-image/{hash}` - OG image
