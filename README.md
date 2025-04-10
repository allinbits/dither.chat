# Dither

A decentralized megaphone for decentralized people.

## Usage

```
docker compose up
```

## Project Structure Explanation

### api-feed

A REST Endpoint Provider for post feeds, and looking up individual posts.

### api-likes

A REST Endpoint Provider for looking up likes by post hash, or reply hash.

### indexer-feed

A mini-indexer that parses memos from a given starting block, and builds feed data into a separate MongoDB database.

### indexer-likes

A mini-indexer that parses memos from a given starting block, and builds vote data into a separate MongoDB database.

### indexer-search

TBD.

### indexer-users

A mini-indexer that parses memos from a given starting block, and builds follower data into a separate MongoDB database.

### nginx

Just an nginx configuration for gateway access to APIs