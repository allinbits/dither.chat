import { LogicalReplicationService, PgoutputPlugin } from 'pg-logical-replication';
import { describe, expect, it, vi } from 'vitest';

import { FeedReplicationService } from '../src/feed';

describe('feed replication service', () => {
  it('registers event handlers', async () => {
    // Arrange
    const service = new LogicalReplicationService({});
    const plugin = new PgoutputPlugin({
      protoVersion: 1,
      publicationNames: ['general'],
    });

    vi.spyOn(service, 'on');

    // Act
    new FeedReplicationService(service, plugin, 'slot1'); // eslint-disable-line no-new

    // Assert
    expect(service.on).toBeCalledWith('data', expect.anything());
    expect(service.on).toBeCalledWith('error', expect.anything());
  });

  it('starts logical replication service', async () => {
    // Arrange
    const slotName = 'slot1';
    const service = new LogicalReplicationService({});
    const plugin = new PgoutputPlugin({
      protoVersion: 1,
      publicationNames: ['general'],
    });
    const feed = new FeedReplicationService(service, plugin, slotName);

    vi.spyOn(service, 'subscribe').mockReturnThis();

    // Act
    await feed.start();

    // Assert
    expect(service.subscribe).toBeCalledWith(plugin, slotName);
  });
});
