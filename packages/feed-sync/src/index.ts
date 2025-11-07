import type { Query } from 'pg';

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

  if (config.telegram.token && config.telegram.chatId) {
    publisher = new TelegramPublisher(config.telegram.token, config.telegram.chatId);
  } else {
    publisher = new ConsolePublisher();
  }

  const { postgresUri, publicationName, slotName } = config;

  if (postgresUri === '') {
    throw new Error('PostgreSQL URI is required');
  }

  const client = new Client({ connectionString: postgresUri });
  await client.connect();
  try {
    // Publish posts sorted by block timestamp and TX hash from older to recent.
    // Replay might be needed when the replayed posts are not available anymore in PostgreSQL WAL.
    // It starts from the first post by default, or optionally from a specified one for a given
    // timestamp and hash. Once started replay publishes all existing posts from the starting point.
    if (config.replay.enabled) {
      const query = buildReplayQuery(config.replay.fromTimestamp, config.replay.fromHash);
      const res = await client.query(query);

      for (const post of res.rows) {
        const { block_height, hash, timestamp } = post;
        logger.debug('Replaying post', { block_height, hash, timestamp });
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

function buildReplayQuery(fromTimestamp?: string, fromHash?: string): Query {
  const query: Query = {
    text: `SELECT * FROM feed ORDER BY timestamp ASC, hash ASC`,
  };

  if (fromTimestamp && fromHash) {
    query.text = `SELECT * FROM feed WHERE timestamp >= $1 AND hash >= $2 ORDER BY timestamp ASC, hash ASC`;
    query.values = [fromTimestamp, fromHash];
  }
  return query;
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
