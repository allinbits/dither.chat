# Network Spammer for Atone Network

This is a minimalist TypeScript project that continuously spams the Atone Network's testnet/devnet with transfers, messages, and replies to simulate real-world activity for testing and development.

## Features

- Posts mock messages to the network.
- Auto-replies chosing randomly between the set of previously posted messages to simulate threaded conversations.
- Delete Posts
- Like / Dislike Posts
- Runs continuously at a configurable interval.

## Project Structure

```bash
mock-tools/
├── src/
│   └── index.ts         # Main script
│   └── client.ts        # Sets up a Cosmos client from mnemonic
│   └── logic.ts         # Will deal with logic on posting, deleting, and replying

├── .env                 # Config file (network URL, interval)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript config
```

## Next Steps
- integrate several clients ✅ 
- integrate a different logic to generate messages not LoremIpsum but maybe some fun facts API, News API to give more natural data for test 