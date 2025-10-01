# Dither Service

The **Dither Service** utilizes **event-sourcing data** to deterministically rebuild application state. This is achieved by processing events streamed directly from cosmos-based chains, specifically **AtomOne**.

## 🚀 Getting Started (Usage)

To quickly spin up the entire Dither Service and its components, use the provided Docker Compose file:

```sh
docker compose up --build
```

You will need to start the frontend service on its own.

## Project Structure Explanation

### [api-main](./packages/api-main/README.md)

A REST Endpoint Provider for post feeds, and looking up individual posts.

### [reader-main](./packages/reader-main/README.md)

A blockchain reader that parses memos, and re-routes them through an event system.

### [cli](./packages/cli)

A small reader that pulls all `dither.` messages from the chain in the last 100 blocks.

### [frontend-main](./packages/frontend-main/README.md)

An frontend Single Page Application for Dither as a whole.
