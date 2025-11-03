import type { Publisher } from './feed/publisher';

import process from 'node:process';

import { Client } from 'pg';

import { config } from './config';
import { ConsolePublisher, TelegramPublisher } from './feed/publisher';
import { ensurePublication, ensureReplicationSlot, FeedReplicationService } from './feed/replication';
import logger from './logger';

// Runs a feed replication service.
export async function main() {
  let publisher: Publisher;

  if (config.telegram.token === '') {
    publisher = new ConsolePublisher();
  } else {
    publisher = new TelegramPublisher(config.telegram.token, config.telegram.chatId);
  }

  const { postgresUri, publicationName, slotName } = config;

  if (postgresUri === '') {
    throw new Error('PostgreSQL URI is required');
  }

  const client = new Client({ connectionString: postgresUri });
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
        logger.info(`Replaying post ${post.hash} with timestamp ${post.timestamp}`);
        await publisher.publish(post);
      }
    }

    // Make sure PostgreSQL is configured to publish WAL updates
    await ensureReplicationSlot(client, config.slotName);
    await ensurePublication(client, publicationName);
  } finally {
    await client.end();
  }

  const service = new FeedReplicationService(postgresUri, publicationName, slotName, publisher);

  const stop = async () => {
    logger.info(`Stopping feed replication service...`);
    await service.stop();
    logger.info(`Stopped`);
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
      logger.error('Feed replication service failed', { cause: (e as Error).message });
      process.exit(1);
    }
  })();
}
