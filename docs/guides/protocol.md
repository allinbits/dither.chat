# Protocol

The protocol is incredibly simple and works entirely through memos.

There is a 512 byte limit on all inputs, so ensure your post is within 512 bytes.

The larger your post in the memo is, the more gas you will need.

## Where to Send?

Dither works with the `bank` module using the message `MsgSend` type.

Which is a fancy way of saying make a transfer and send at least `0.000001 PHOTON` to have your message indexed.

The receiving address must be `atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep`

```sh
atomoned tx bank send <from_address> atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep 0.000001 --chain-id <chain_id> --fees <fees> --memo "dither.Post(\"Hello World!\")"
```

## Protocol Examples

```ts
// Post: Expects a single argument (the message content).
dither.Post("This is a new status update.")

// Reply: Expects two arguments (the PostHash being replied to, and the reply message).
dither.Reply("0xabc123...","My thoughts on this post.")

// Remove: Expects a single argument (the PostHash to remove).
// Can only remove own posts, but they are not removed from chain.
dither.Remove("0xdef456...")

// Follow: Expects a single argument (the Address of the user to follow).
dither.Follow("cosmos1userA")

// Unfollow: Expects a single argument (the Address of the user to unfollow).
dither.Unfollow("cosmos1userB")

// Like: Expects a single argument (the PostHash to like).
dither.Like("0xghi789...")

// Dislike: Expects a single argument (the PostHash to dislike).
dither.Dislike("0xjkl012...")

// Flag: Expects a single argument (the PostHash to flag).
dither.Flag("0xmnp345...")
```

- **On-Chain Commit**: AtomOne includes the transaction in a block. The memo and PHOTON transfer are public and immutable.
- **Frontend Consumption**: `frontend-main` fetches paginated feeds and notifications from `api-main` using Vue Query. When a user loads the app, they see the new post pulled from Postgres.
- **Optional Integrations**: Discord webhooks, CLI tools, or future data pipelines can subscribe to the same REST endpoints or replicate the reader logic.

> Document updates should accompany any protocol change. If new memo signatures are introduced, update this guide, the reader parser (`packages/reader-main/src/messages`), and shared type definitions (`packages/lib-api-types`).
