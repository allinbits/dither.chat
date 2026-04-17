# Dither Service

Dither is a memo-based social protocol that runs on the AtomOne blockchain. This repository contains the full reference implementation: the blockchain reader that interprets `dither.*` memos, the REST API that reconstructs application state, and the Vue SPA that renders the social feed. The goal of this document is to give new stewards enough context to run, extend, and eventually transfer custody of the platform safely.

## Table of Contents

- [Dither Service](#dither-service)
  - [Table of Contents](#table-of-contents)
  - [System Architecture](#system-architecture)
  - [Transaction Lifecycle](#transaction-lifecycle)
  - [Package Topology](#package-topology)
  - [Running the Stack Locally](#running-the-stack-locally)
    - [Prerequisites](#prerequisites)
    - [Quick Start with Tilt](#quick-start-with-tilt)
    - [Manual Workflow](#manual-workflow)
  - [Required Environment Variables](#required-environment-variables)
  - [Operational Responsibilities](#operational-responsibilities)
  - [Production Deployment Checklist](#production-deployment-checklist)
  - [Developer Workflow](#developer-workflow)
    - [Installing \& Bootstrapping](#installing--bootstrapping)
    - [Testing](#testing)
    - [Linting \& Formatting](#linting--formatting)
    - [Hot Reload](#hot-reload)
  - [Support \& Escalation](#support--escalation)
  - [Reference Material](#reference-material)

## System Architecture

```
 ┌──────────────────┐       ┌────────────────────┐       ┌──────────────────────┐
 │  Wallet Client   │       │   reader-main      │       │      api-main        │
 │ (Keplr/Leap/etc) │──────▶│  (ChronoState app) │──────▶│  (Elysia + Postgres) │
 └──────────────────┘       └────────────────────┘       └──────────────────────┘
                                                              │
                                                              ▼
                                                     ┌─────────────────┐
                                                     │ PostgreSQL (db) │
                                                     └─────────────────┘
                                                              │
                                                              ▼
                                                     ┌──────────────────┐
                                                     │ frontend-main    │
                                                     │ (Vue 3 + Vite)   │
                                                     └──────────────────┘
```

- **Wallet Client**: Users broadcast `MsgSend` transactions on AtomOne with a `dither.*` memo. PHOTON fees/tips are sent to a community-controlled address.
- **`reader-main`**: A ChronoState application that tails AtomOne blocks, extracts memos, enriches them, and forwards normalized actions to the REST API using a shared `AUTH` secret.
- **`api-main`**: An ElysiaJS service backed by Postgres and Drizzle ORM. It verifies authorization, persists posts/replies/follows, and exposes REST endpoints consumed by the frontend.
- **PostgreSQL**: Stores the canonical application state (feed, replies, notifications, moderator actions).
- **`frontend-main`**: A Vue 3 SPA that renders the social feed and manages wallet interactions via Cosmos SDK libraries.

## Transaction Lifecycle

1. **Compose & Sign**: A wallet (Keplr, Leap, Cosmostation) sends `MsgSend` with `memo = dither.Post("hello world")`, denomination `uphoton`, recipient `atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep`.
2. **On-Chain Commit**: AtomOne includes the transaction in a block. The memo and PHOTON transfer are public and immutable.
3. **Reader Ingestion**: `reader-main` streams the block, detects the `dither.*` memo, normalizes the payload, and calls `api-main` with the parsed data plus the original transaction metadata.
4. **API Persistence**: `api-main` validates the request (AUTH header, memo length), writes to Postgres via prepared statements, triggers side effects like notifications, and confirms back to the reader.
5. **Frontend Consumption**: `frontend-main` fetches paginated feeds and notifications from `api-main` using Vue Query. When a user loads the app, they see the new post pulled from Postgres.
6. **Optional Integrations**: Discord webhooks, CLI tools, or future data pipelines can subscribe to the same REST endpoints or replicate the reader logic.

> [!IMPORTANT]
> All PHOTON fees/tips are directed to `atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep` for the interim. Stewardship requires rotating this address to a multi-party key and eventually migrating to DAO-controlled governance.

## Package Topology

| Package                             | Purpose                                                                 |
|-------------------------------------|-------------------------------------------------------------------------|
| `packages/api-main`                 | REST API (ElysiaJS + Drizzle + Postgres)                                |
| `packages/reader-main`              | ChronoState reader that parses `dither.*` memos                         |
| `packages/frontend-main`            | Vue 3 SPA for browsing and posting                                      |
| `packages/lib-api-types`            | Shared TypeScript types between reader and API                          |
| `packages/tool-network-spammer`     | Utility script for stress testing the network                           |
| `packages/cli`                      | CLI tool that fetches recent `dither.*` messages                        |
| `docs/`                             | Protocol docs, FAQs, and runbook drafts                                 |
| `Tiltfile`                          | Local orchestration with Tilt                                           |
| `docker-compose.yml`                | Development docker services (Postgres, reader, API)                     |

## Running the Stack Locally

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker Desktop or compatible engine
- Optional: [Tilt](https://tilt.dev/) for orchestrating services

### Quick Start with Tilt
```bash
# Install dependencies
pnpm install

# Provide required secrets in .env or shell (see next section)
export AUTH="local-shared-secret"
export JWT="$(openssl rand -hex 64)"
export PG_URI="postgresql://default:password@localhost:5432/postgres"

# Launch the full stack
tilt up
# Dashboard: http://localhost:10350/
```

### Manual Workflow
```bash
# Install dependencies
pnpm install

# Start Postgres, reader, and API
docker compose up -d --build

# Seed database schema (first run)
pnpm --dir packages/api-main db:push

# Start frontend
cd packages/frontend-main
pnpm dev    # served at http://localhost:5173
```

> [!NOTE]
> The API auto-generates a JWT secret if `process.env.JWT` is missing. This behavior is slated for removal; always set a stable value in development and production to avoid session churn.

## Required Environment Variables

| Variable    | Component        | Description                                                                                 |
|-------------|------------------|---------------------------------------------------------------------------------------------|
| `AUTH`      | reader + API     | Shared secret that authorizes reader requests. Must be identical across reader/API.        |
| `JWT`       | API              | Secret used to sign authentication cookies. Must be long, random, and managed per env.     |
| `PG_URI`    | API              | PostgreSQL connection string. Example: `postgresql://user:pass@host:5432/dbname`.          |
| `JWT_STRICTNESS` | API        | Controls cookie attributes (`lax`, `strict`, `none`). Defaults to `lax` if unset.           |
| `DISCORD_WEBHOOK_URL` | API | Optional webhook for post notifications. Empty string disables Discord integration.        |
| `API_URLS`  | reader           | Comma-separated list of API base URLs.                                                      |
| `RECEIVER`  | reader           | AtomOne address that receives PHOTON tips (currently the community fund address).          |
| `MEMO_PREFIX` | reader        | Memo prefix to parse (defaults to `dither.`).                                               |

> [!IMPORTANT]
> Explicitly set these variables in production. Relying on the defaults (`'default'`, random JWT) will break authentication or leave the reader in a retry loop.

## Operational Responsibilities

- **Fund Key Custody**: All PHOTON tips are sent to `atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep`. Rotate this to a stewardship-controlled key immediately, then plan a multi-sig/DAO migration for the first official release.
- **Deployment Targets**: Historically deployed via Fly.io (`fly.mainnet.toml`, `fly.testnet.toml`) and Netlify (frontend). Tilt simplifies local orchestration but still requires explicit secrets.
- **Secrets Management**: Avoid committing `.env` files. Coordinate rotation across reader/API; mismatched `AUTH` causes silent reader failure.
- **Monitoring & Alerts**: There is no automated observability. Add basic health checks (`/v1/health`) and post-deploy smoke tests before shipping changes to mainnet.
- **Discord Webhooks**: Currently synchronous; expect higher latency if Discord is slow. Consider moving to an async queue.
- **Rate Limiting**: Implemented in Postgres with per-second cleanup. Monitor table growth and plan migration to Redis or Cloudflare KV for production scale.

## Production Deployment Checklist

1. Confirm `AUTH` and `JWT` secrets are provisioned in the target environment and match reader/API.
2. Ensure Postgres migrations (`pnpm --dir packages/api-main db:push`) are applied before rolling services.
3. Rotate the fund receiver address if ownership is transitioning; document the custodian.
4. Deploy `reader-main` and `api-main` sequentially to avoid memo backlogs.
5. Run smoke tests: `GET /v1/health`, `GET /v1/feed?limit=5`, create a test post on staging.
6. Verify Discord webhook (if configured) is delivering responses; disable if unavailable.
7. Announce deploy window to validators/community if service interruptions are expected.
8. After deploy, monitor logs for reader authorization failures and rate limiter churn.

## Developer Workflow

### Installing & Bootstrapping
```bash
pnpm install
pnpm -r build   # optional: build all packages
```

### Testing
```bash
pnpm --dir packages/api-main test
pnpm --dir packages/reader-main test
# Frontend currently has no automated tests; linting covers Vue components.
```

### Linting & Formatting
```bash
pnpm lint      # runs ESLint across packages
pnpm format    # if configured
```

### Hot Reload
- `pnpm dev`: Run in `packages/frontend-main` to enable Vite hot reload.
- Docker Compose: Mounts source directories for reader/API so code changes reflect automatically.

## Support & Escalation

- **Issue Tracker**: Use GitHub issues for bugs, enhancements, and audit follow-ups. Reference `DITHER_ISSUE_MANAGEMENT_PLAN.md` for triage workflow.
- **Operational Incidents**: If reader → API communication fails (AUTH mismatch, network issues), expect the reader to retry indefinitely. Investigate secrets first.
- **Community Channels**: Announce significant outages or fund key changes in the AtomOne Discord/Telegram servers.
- **Security Contact**: Report vulnerabilities privately to the stewardship team before disclosure.

## Reference Material

- [`packages/frontend-main/ARCHITECTURE.md`](./packages/frontend-main/ARCHITECTURE.md): Detailed frontend component guide.
- [`packages/frontend-main/STYLEGUIDE.md`](./packages/frontend-main/STYLEGUIDE.md): UI conventions and design tokens.
- [`packages/api-main/README.md`](./packages/api-main/README.md): Additional API usage notes.
- [`packages/reader-main/README.md`](./packages/reader-main/README.md): Reader configuration hints.
- [`docs/guides/protocol.md`](./docs/guides/protocol.md): Memo protocol reference and CLI tips.
- [`docs/guides/FAQ.md`](./docs/guides/FAQ.md): Frequently asked questions for users.

For outstanding issues and remediation tracking, consult `DITHER_ISSUE_MANAGEMENT_PLAN.md` and the GitHub issue tracker. Handle secrets and custody before ramping up adoption. The current goal is stability first, growth second.
