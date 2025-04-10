# Dither

A decentralized megaphone for decentralized people.

## Usage

```
docker compose up
```

## Project Structure Explanation

### [api-feed](./packages/api-feed/README.md)

A REST Endpoint Provider for post feeds, and looking up individual posts.

### [api-likes](./packages/api-likes/README.md)

A REST Endpoint Provider for looking up likes by post hash, or reply hash.

### [indexer-feed](./packages/indexer-feed/README.md)

A mini-indexer that parses memos from a given starting block, and builds feed data into a separate MongoDB database.

### [indexer-likes](./packages/indexer-likes/README.md)

A mini-indexer that parses memos from a given starting block, and builds vote data into a separate MongoDB database.

### [indexer-search](./packages/indexer-search/README.md)

TBD.

### [indexer-users](./packages/indexer-users/README.md)

A mini-indexer that parses memos from a given starting block, and builds follower data into a separate MongoDB database.

### nginx

Just an nginx configuration for gateway access to APIs