# API Feed

This uses elysia to serve data from the relevant database.

Automatically includes pagination for data retrieved.

## Endpoints

Data should be accessible through

### Get Feed

Returns latest feed data

```
http://feed.localhost/posts?limit=100&page=0
```

### Get Transaction

Returns the message information, and all replies to that post.

```
http://feed.localhost/post?hash=transaction_hash
```
