import process from 'node:process';

import { LogicalReplicationService, PgoutputPlugin } from 'pg-logical-replication';

import { useConfig } from './config';
import { FeedReplicationService } from './feed';
import { ConsolePublisher } from './feed/publisher';

export async function main() {
  const config = useConfig();

  // TODO: Support replaying existing messages

  const service = new LogicalReplicationService({
    connectionString: config.PG_URI,
    connectionTimeoutMillis: 0,
  });

  const plugin = new PgoutputPlugin({
    protoVersion: 1,
    publicationNames: config.PUBLICATION_NAMES,
  });

  // TODO: Replace by TelegramPublisher and use console only to debug
  const publisher = new ConsolePublisher();

  const feedReplicationService = new FeedReplicationService(service, plugin, config.SLOT_NAME, publisher);
  await feedReplicationService.start();
}

if (!process.env.SKIP_START) {
  main().catch(console.error);
}
