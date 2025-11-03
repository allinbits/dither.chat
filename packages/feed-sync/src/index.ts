import type { Publisher } from './feed/publisher';

import process from 'node:process';

import { Client } from 'pg';

import { useConfig } from './config';
import { ConsolePublisher, TelegramPublisher } from './feed/publisher';
import { ensurePublication, ensureReplicationSlot, FeedReplicationService } from './feed/replication';

// Runs a feed replication service.
export async function main() {
  let publisher: Publisher;

  const config = useConfig();
  if (config.telegram.token === '') {
    publisher = new ConsolePublisher();
  } else {
    publisher = new TelegramPublisher(config.telegram.token, config.telegram.chatId);
  }

  const client = new Client({ connectionString: config.postgresUri });
  await client.connect();
  try {
    // TODO: If posts are replayed make sure that feed replication service only
    //       publishes posts that are greater than the last replayed post.
    //       This is required to avoid potentially publishing some posts more than once.
    //       Replay iterates posts from feed table, and replications service iterates
    //       posts from the WAL which could be duplicated for recent posts.

    // Publish posts sorted by block timestamp and TX hash from older to recent
    if (config.replayPosts) {
      const res = await client.query(`SELECT * FROM feed ORDER BY timestamp ASC, hash ASC`);
      for (const post of res.rows) {
        console.log(`Replaying post ${post.hash} with timestamp ${post.timestamp}`);
        await publisher.publish(post);
      }
    }

    // Make sure PostgreSQL is configured to publish WAL updates
    await ensureReplicationSlot(client, config.slotName);
    await ensurePublication(client, 'feed_pub');
  } finally {
    await client.end();
  }

  const { postgresUri, publicationNames, slotName } = config;
  const service = new FeedReplicationService(postgresUri, publicationNames, slotName, publisher);

  const stop = async () => {
    console.log(`Stopping feed replication service...`);
    await service.stop();
    console.log(`Stopped`);
    process.exit(0);
  };

  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);

  await service.start();
}

if (!process.env.SKIP_START) {
  (async () => {
    try {
      await main();
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
