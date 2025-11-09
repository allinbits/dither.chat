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

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
