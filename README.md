# Dither Service

Dither Service is a provider engine for individual front-end applications to listen to the Dither Protcol.

The Dither Service uses event-sourcing data to rebuild application state from Cosmos based chains, specifically AtomOne.

## Usage

```
docker compose up --build
```

## Project Structure Explanation

### [api-main](./packages/api-main/README.md)

A REST Endpoint Provider for post feeds, and looking up individual posts.

### [reader-main](./packages/reader-main/README.md)

A blockchain reader that parses memos, and re-routes them through an event system.

### nginx

Just an nginx configuration for gateway access to APIs

### [frontend-main](./packages/frontend-main/README.md)

An frontend Single Page Application for Dither as a whole.