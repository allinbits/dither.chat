# OG Meta Edge Functions

Dynamic OG meta tags and image generation for social media previews.

## Functions

- **`post-meta.ts`** - Handles `/post/*` routes, returns HTML with dynamic OG meta tags
- **`og-image.ts`** - Handles `/og-image/*` routes, generates 1200×630 SVG images

## Setup

Set `API_ROOT` in Netlify dashboard or `netlify.toml`:

```toml
[build.environment]
API_ROOT = "https://api.mainnet.dither.chat/v1"
```

## Testing

```bash
# Local
netlify dev

# Test endpoints
curl http://localhost:8888/post/{hash}
curl http://localhost:8888/og-image/{hash}

# Automated test
./test-og-meta.sh {hash} {base_url}
```

## Online Validators

- [opengraph.xyx](https://www.opengraph.xyz/url/https%3A%2F%2Fditherbot.netlify.app%2Fpost%2F76a62f84a5b57da2c1c8a8f08264563a7bbde06e3a5f5cb63ea552d6d943d5ee)
