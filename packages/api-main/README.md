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
3. API verifies the proof in background.
4. Link is updated to `verified` or `failed`.

Verification checks:

- `x`: proof URL must be a tweet URL. The tweet author must match the claimed username and the tweet text must contain the generated verification code.
- `github`: proof URL must be `https://gist.github.com/{username}/{gistid}`. The gist owner must match the claimed username and file `dither.md` must contain the generated verification code.

For local development, you can bypass external checks by setting:

```
SKIP_SOCIAL_VERIFICATION=true
```
