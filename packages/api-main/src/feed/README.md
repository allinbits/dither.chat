# Feed Module

This module handles feed queries, custom feed definitions, and the query params API.

## Design Philosophy

- **Transparent:** Every filter and sort is explicit in the query
- **Algorithm-less:** No hidden logic - what you see is what you get
- **Shareable:** Feed queries are templates that work for any user
- **Explicit user data:** When user-specific data is used, it's visible via `$variables`

## Syntax

```
field[$operator]=value
```

## Operators

| Operator  | Description               | Example                     |
| --------- | ------------------------- | --------------------------- |
| `$eq`     | Equals                    | `author[$eq]=atone1abc`     |
| `$in`     | In list (comma-separated) | `author[$in]=atone1,atone2` |
| `$nin`    | Not in list               | `author[$nin]=atone1`       |
| `$search` | Text search (see below)   | `message[$search]=bitcoin`  |
| `$gte`    | Greater than or equal     | `likes[$gte]=10`            |
| `$lte`    | Less than or equal        | `likes[$lte]=100`           |
| `$gt`     | Greater than              | `replies[$gt]=0`            |
| `$lt`     | Less than                 | `dislikes[$lt]=5`           |

## Available Fields

Fields from the `feed` table that can be filtered/sorted:

| Field            | Type      | Description                      | Notes                     |
| ---------------- | --------- | -------------------------------- | ------------------------- |
| `hash`           | varchar   | Transaction hash (primary key)   |                           |
| `post_hash`      | varchar   | Parent post hash (for replies)   |                           |
| `author`         | varchar   | User address                     |                           |
| `timestamp`      | timestamp | When the post was created        |                           |
| `message`        | varchar   | Post content (max 512 chars)     | Supports `$search`        |
| `quantity`       | text      | Tokens spent on this post        | Numeric comparison (CAST) |
| `replies`        | integer   | Reply count                      |                           |
| `likes`          | integer   | Like count                       |                           |
| `dislikes`       | integer   | Dislike count                    |                           |
| `flags`          | integer   | Flag count                       |                           |
| `likes_burnt`    | text      | Total tokens burnt from likes    | Numeric comparison (CAST) |
| `dislikes_burnt` | text      | Total tokens burnt from dislikes | Numeric comparison (CAST) |
| `flags_burnt`    | text      | Total tokens burnt from flags    | Numeric comparison (CAST) |

**Note:** Fields marked "Numeric comparison (CAST)" are stored as TEXT (for BigInt support) but use `CAST(... AS NUMERIC)` for comparison operators (`$gte`, `$lte`, `$gt`, `$lt`).

## Search Operator

The `$search` operator uses PostgreSQL full-text search with `plainto_tsquery`.

| Delimiter   | Logic   | Example                                                                         |
| ----------- | ------- | ------------------------------------------------------------------------------- |
| `,` (comma) | OR      | `message[$search]=btc,atone` → btc OR atone                                     |
| `+` (plus)  | AND     | `message[$search]=crypto+regulation` → crypto AND regulation                    |
| Combined    | Grouped | `message[$search]=btc+news,atone+update` → (btc AND news) OR (atone AND update) |

For phrases with spaces, use URL encoding (`%20`):

```
message[$search]=hello%20world           // phrase "hello world"
message[$search]=new%20york,london       // "new york" OR "london"
```

## Variables

Variables resolve to the authenticated user's data at query time.

| Variable     | Resolves to                   |
| ------------ | ----------------------------- |
| `$me`        | Current user's address        |
| `$following` | Current user's following list |

**Note:** Variables require authentication. Without auth, filters using variables are skipped.

## Time Filters

| Param             | Description          | Example                                |
| ----------------- | -------------------- | -------------------------------------- |
| `timeframe`       | Relative time window | `timeframe=24h`, `timeframe=7d`        |
| `timestamp[$gt]`  | After date           | `timestamp[$gt]=2024-01-01`            |
| `timestamp[$lt]`  | Before date          | `timestamp[$lt]=2024-12-31`            |
| `timestamp[$gte]` | On or after date     | `timestamp[$gte]=2024-01-01T14:00:00Z` |

The `timeframe` parameter supports units: `h` (hours), `d` (days), `w` (weeks), `m` (months).

## Sorting

Prefix with `-` for descending order:

```
sort=timestamp           // ascending (oldest first)
sort=-timestamp          // descending (newest first)
sort=-likes              // most liked first
sort=-likes,-timestamp   // most liked, then newest
```

## Content Type Includes

```
include[reposts]=true    // include reposts (default: false)
include[replies]=true    // include replies (default: false)
include[posts]=true      // include original posts (default: true)
```

## Built-in Feeds

Built-in feeds are defined in `config/builtins.ts`.

## Examples

### Common Queries

```bash
# global timeline
sort=-timestamp

# following feed
author[$in]=$following&sort=-timestamp&include[reposts]=true

# trending (24h)
timeframe=24h&likes[$gte]=10&sort=-likes

# my profile
author[$eq]=$me&include[reposts]=true&sort=-timestamp

# high-value posts (quantity filter)
quantity[$gte]=1000000&sort=-quantity
```

### Search Examples

```bash
# topic feed (OR search)
message[$search]=bitcoin,atone&timeframe=24h&sort=-likes

# topic feed (AND search)
message[$search]=ai+startup&timeframe=7d&sort=-likes
```

## Parameter Reference

| Category       | Param                                           | Example                      |
| -------------- | ----------------------------------------------- | ---------------------------- |
| **Author**     | `author[$in]`, `author[$eq]`, `author[$nin]`    | `author[$in]=$following`     |
| **Content**    | `message[$search]`                              | `message[$search]=btc,atone` |
| **Engagement** | `likes[$gte]`, `replies[$gte]`, `flags[$gte]`   | `likes[$gte]=10`             |
| **Tokens**     | `quantity[$gte]`, `likes_burnt[$gte]`           | `quantity[$gte]=1000000`     |
| **Time**       | `timeframe`, `timestamp[$gt]`, `timestamp[$lt]` | `timeframe=24h`              |
| **Sorting**    | `sort`                                          | `sort=-likes`                |
| **Includes**   | `include[reposts]`, `include[replies]`          | `include[reposts]=true`      |
| **Variables**  | `$me`, `$following`                             | `author[$in]=$following`     |

## Roadmap

Features that could be added:

### Mute/Block Variables

```
$muted                   // current user's muted accounts
$blocked                 // current user's blocked accounts
```

Would enable feeds like:

```
author[$in]=$following&author[$nin]=$muted&author[$nin]=$blocked&sort=-timestamp
```

### Media Filters

```
has_media=true           // posts with images/video
has_links=true           // posts with URLs
```

Would require adding `has_media` and `has_links` columns to the schema.

### Post Length Filter

```
length[$gte]=200         // minimum post length
length[$lte]=280         // maximum post length
```

Could be implemented as a computed field on `message` length.

### Additional Variables

```
$followers               // current user's followers list
$following(address)      // another user's following list (public data)
```

### Combining Queries

For cases where a feed might not return enough results, a way to combine or fallback to other queries:

```
filters[0][message.$search]=bitcoin&filters[0][timeframe]=6h&filters[0][likes.$gte]=10
filters[1][author.$in]=$following
mode=union
```
