import process from 'node:process';

import { LogicalReplicationService, PgoutputPlugin } from 'pg-logical-replication';

import { useConfig } from './config';
import { FeedReplicationService } from './feed';

export async function main() {
  const config = useConfig();

  // TODO: Support reading existing and new messages and push them though a publisher

  const service = new LogicalReplicationService({
    connectionString: config.PG_URI,
    connectionTimeoutMillis: 0,
  });

  const plugin = new PgoutputPlugin({
    protoVersion: 1,
    publicationNames: config.PUBLICATION_NAMES,
  });

  const feedReplicationService = new FeedReplicationService(service, plugin, config.SLOT_NAME);
  await feedReplicationService.start();
}

if (!process.env.SKIP_START) {
  main().catch(console.error);
}
