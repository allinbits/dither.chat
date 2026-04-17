# API Main

This uses elysia to serve data from the relevant database.

## Tech Stack

- [REST API - ElysiaJS](https://elysiajs.com)
- [Database - PostgreSQL](https://www.postgresql.org)
- [SQL ORM - Drizzle](https://orm.drizzle.team)

## Usage

Start the PostgreSQL Database

```
docker compose up
```

Push Table Structure to PostgreSQL from Drizzle

_This should only be ran once, and ran each time you clear the `data` folder._

```
pnpm db:push
```

Run the application

```
pnpm install
pnpm start
```

All data for postgres is stored in the `data` directory.

## Testing

> [!Caution]
> When running tests all tables will be cleaned out for a clean test environment. You've been warned.

Start the PostgreSQL Database

```
docker compose up
```

Push Table Structure to PostgreSQL from Drizzle

_This should only be ran once, and ran each time you clear the `data` folder._

```
pnpm db:push
```

Run the Tests

```
pnpm install
pnpm test
```

## Social Verification

Social username verification is asynchronous:

1. Client submits a proof with `platform`, `username`, and `proof_url`.
2. API stores the link as `pending`.
3. API verifies the proof in background (with retries).
4. Link is updated to `verified` or `failed`.

### Providers

**X (Twitter)**

Uses [X API v2](https://developer.x.com/en/docs/x-api) to fetch tweet data. The proof URL must be a tweet URL (e.g., `https://x.com/username/status/123`). Verification checks:

- Tweet author matches the claimed username
- Tweet text contains the verification code

**GitHub**

Uses [GitHub REST API](https://docs.github.com/en/rest) to fetch gist data. The proof URL must be a gist URL (e.g., `https://gist.github.com/username/gistid`). Verification checks:

- Gist owner matches the claimed username
- File `dither.md` exists and contains the verification code

### Environment Variables

| Variable                   | Description                                        |
| -------------------------- | -------------------------------------------------- |
| `X_BEARER_TOKEN`           | Bearer token for X API authentication              |
| `GITHUB_BEARER_TOKEN`      | Personal access token for GitHub API               |
| `SKIP_SOCIAL_VERIFICATION` | Set to `true` to bypass external checks (dev only) |
