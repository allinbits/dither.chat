# Frequently Asked Questions

> [!IMPORTANT]
> Dither will never ask for your mnemonic or private key. Beware of impostor sites or bots that request seed phrases. Always verify URLs and bot usernames before interacting.

## About Dither

**What is Dither?**  
Dither is a memo-based social protocol built on the AtomOne blockchain. Every post, reply, and reaction is a real transaction recorded on-chain. The open-source reader/API/frontend stack in this repository provides the canonical implementation.

**Why run social posts on-chain?**  
On-chain posts are censorship-resistant, timestamped, and permanently verifiable. Governance communities (validators, DAO delegates) can publish positions that cannot be altered or removed by a centralized platform.

## Posting & Fees

**How do I post?**  
Use the web app ([dither.chat](https://dither.chat)) or broadcast a `MsgSend` transaction with a `dither.Post("message")` memo via CLI. See [`usage.md`](./usage.md) for step-by-step instructions.

**Why does posting cost PHOTON?**  
Each post/reaction burns a fraction of a PHOTON to cover indexing operations and validator costs. Typical fees are under 0.01 PHOTON (fractions of a cent).

**Can I post for free?**  
Not currently. Fee grants may be introduced later, but the protocol expects a small PHOTON payment to prevent spam and fund operations.

## Content & Features

**Is there a character limit?**  
Yes. Memos are capped at 512 bytes. Longer messages must be split or linked externally.

**Can I upload images or files?**  
No. Dither stores plain text only. Link to content hosted on third-party services if needed.

**Can posts be deleted?**  
Posts remain on-chain permanently. `dither.Remove` marks them as removed in the off-chain index so the frontend can hide them, but the original transaction remains accessible.

**Does Dither use algorithms or ranking?**  
No. The current frontend renders chronological feeds. Communities can build alternative frontends if they want curated or algorithmic views.

## Wallet & Security

**Which wallets are supported?**  
Keplr, Leap, and Cosmostation for AtomOne. Desktop browsers require the extension; mobile users should open Dither inside the wallet’s in-app browser.

**What permissions does Dither need?**  
You sign a session message (no funds move) and then approve transactions when posting. Dither never gains spending authority beyond the specific transactions you sign.

**What if my session keeps expiring?**  
Sessions last ~3 days. API restarts currently rotate JWT secrets, forcing re-authentication. This behavior is being addressed; for now, re-sign when prompted.

## Protocol Details

**Where are the posts stored?**  
On AtomOne. The receiver address is currently `atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep`. Reader services fetch from the blockchain and persist normalized state in Postgres for fast querying.

**How are replies and reactions encoded?**  
Replies: `dither.Reply(parentHash, "message")`  
Likes: `dither.Like(targetHash)`  
Dislikes: `dither.Dislike(targetHash)`  
Flags: `dither.Flag(targetHash)`  
Follow: `dither.Follow(address)`  
See [`protocol.md`](./protocol.md) for the full catalogue.

**What happens if someone sends a malformed memo?**  
The reader skips transactions that fail validation (wrong prefix, wrong address, memo too long, etc.). The memo remains on-chain, but it won't appear in the indexed feed.

## Moderation & Governance

**Can moderators remove content?**  
Moderators can hide content in the off-chain index, preventing it from appearing in the frontend. They cannot delete on-chain data. Moderator actions are logged via API endpoints, not public memos.

**Who controls the PHOTON fund address?**  
Historically, a single maintainer. Stewardship is rotating the key to a multi-party custodial model and planning a DAO governance structure. Check the main README and release notes for updates.

**How do I report abuse?**  
File an issue on GitHub or contact the stewardship team via community channels (Discord, Telegram). Include links to the relevant transaction hashes.

## Troubleshooting

**My post isn't showing up. Why?**  
Check the transaction on an AtomOne explorer such as [https://explorers.guru/chain/atomone](https://explorers.guru/chain/atomone) to confirm it succeeded. If it did, but the post is missing, the reader or API may be experiencing issues. Check status channels or GitHub issues.

**I'm seeing “insufficient funds” errors.**  
Ensure you have enough PHOTON for the burn and ATONE for network fees. Wallets typically require both balances to complete a transaction.

**I can’t connect my wallet.**  
Make sure the wallet has the AtomOne network configured. In Keplr, open Settings → Manage Chain Visibility → enable AtomOne.

## Further Reading

- [`usage.md`](./usage.md): End-user guide to connecting wallets and posting.
- [`protocol.md`](./protocol.md): Detailed memo formats and validation rules.
- [`README.md`](../../README.md): Architecture and operational overview.

If your question isn’t covered, open an issue or contact the stewardship team directly. Dither is evolving quickly, so feedback and contributions are welcome.