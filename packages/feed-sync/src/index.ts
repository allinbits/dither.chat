import { LogicalReplicationService, PgoutputPlugin } from 'pg-logical-replication';

import { useConfig } from './config';
import { db } from './db';
import { FeedReplicationService } from './feed';

async function main() {
  const config = useConfig();

  const client = await db.getClient();
  await db.createReplicationSlot(config.SLOT_NAME);

  const service = new LogicalReplicationService(client);

  const plugin = new PgoutputPlugin({
    protoVersion: 1,
    publicationNames: config.PUBLICATION_NAMES,
  });

  const feedReplicationService = new FeedReplicationService(service, plugin, config.SLOT_NAME);
  await feedReplicationService.start();
}

main().catch(console.error);
