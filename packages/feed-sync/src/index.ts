import { LogicalReplicationService, PgoutputPlugin } from 'pg-logical-replication';

import { useConfig } from './config';
import { db } from './db';
import { FeedReplicationService } from './feed';

async function main() {
  const config = useConfig();

  const client = await db.getClient();
  const service = new LogicalReplicationService(client);

  const plugin = new PgoutputPlugin({
    protoVersion: 1,
    publicationNames: config.PUBBLICATION_NAMES,
  });

  const feedReplicationService = new FeedReplicationService(service, plugin, config.SLOT_NAME);
  await feedReplicationService.start();
}

main().catch(console.error);
