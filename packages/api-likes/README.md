# API Likes

This uses elysia to serve data from the relevant database.

Automatically includes pagination for data retrieved.

## Access

Data should be accessible through

### Get Likes for Post

```
http://likes.localhost?hash=transaction_hash
```

### Get Likes for Reply

```
http://likes.localhost?hash=transaction_hash&post=transaction_hash
```

