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
    await ensureReplicationSlot(client, config.SLOT_NAME);

    // TODO: Support replaying posts (env.REPLAY_POSTS)

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
