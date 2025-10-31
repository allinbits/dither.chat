import process from 'node:process';

import { Client } from 'pg';
import { LogicalReplicationService, PgoutputPlugin } from 'pg-logical-replication';

import { useConfig } from './config';
import { ConsolePublisher } from './feed/publisher';
import { ensurePublication, ensureReplicationSlot, FeedReplicationService } from './feed/replication';

export async function main() {
  // TODO: Replace by TelegramPublisher and use console only to debug
  const publisher = new ConsolePublisher();

  const config = useConfig();
  const client = new Client({ connectionString: config.PG_URI });
  await client.connect();

  try {
    // TODO: If posts are replayed make sure that feed replication service only
    //       publishes posts that are greater than the last replayed post.
    //       This is required to avoid potentially publishing some posts more than once.
    //       Replay iterates posts from feed table, and replications service iterates
    //       posts from the WAL which could be duplicated for recent posts.

    if (config.REPLAY_POSTS) {
      // Publish posts sorted by block timestamp and TX hash from older to recent
      const res = await client.query(`SELECT * FROM feed ORDER BY timestamp ASC, hash ASC`);
      res.rows.forEach(publisher.publish);
    }

    await ensureReplicationSlot(client, config.SLOT_NAME);
    await ensurePublication(client, 'feed_pub');
  } finally {
    await client.end();
  }

  const service = new LogicalReplicationService({
    connectionString: config.PG_URI,
    connectionTimeoutMillis: 0,
  });

  const plugin = new PgoutputPlugin({
    protoVersion: 1,
    publicationNames: config.PUBLICATION_NAMES,
  });

  const feedReplicationService = new FeedReplicationService(service, plugin, config.SLOT_NAME, publisher);
  await feedReplicationService.start();
}

if (!process.env.SKIP_START) {
  main().catch(console.error);
}
