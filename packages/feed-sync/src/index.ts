import { LogicalReplicationService, PgoutputPlugin } from 'pg-logical-replication';

import { useConfig } from './config';
import { FeedReplicationService } from './feed';

async function main() {
  const config = useConfig();

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

main().catch(console.error);
