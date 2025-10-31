import { LogicalReplicationService, PgoutputPlugin } from 'pg-logical-replication';
import { describe, expect, it, vi } from 'vitest';

import { NopePublisher } from '../src/feed/publisher';
import { FeedReplicationService } from '../src/feed/replication';

describe('feed replication service', () => {
  it('registers event handlers', async () => {
    // Arrange
    const publisher = new NopePublisher();
    const service = new LogicalReplicationService({});
    const plugin = new PgoutputPlugin({
      protoVersion: 1,
      publicationNames: ['feed_pub'],
    });

    vi.spyOn(service, 'on');

    // Act
    new FeedReplicationService(service, plugin, 'slot1', publisher); // eslint-disable-line no-new

    // Assert
    expect(service.on).toBeCalledWith('data', expect.anything());
    expect(service.on).toBeCalledWith('error', expect.anything());
  });

  it('starts logical replication service', async () => {
    // Arrange
    const slotName = 'slot1';
    const publisher = new NopePublisher();
    const service = new LogicalReplicationService({});
    const plugin = new PgoutputPlugin({
      protoVersion: 1,
      publicationNames: ['feed_pub'],
    });
    const feed = new FeedReplicationService(service, plugin, slotName, publisher);

    vi.spyOn(service, 'subscribe').mockReturnThis();

    // Act
    await feed.start();

    // Assert
    expect(service.subscribe).toBeCalledWith(plugin, slotName);
  });
});
