import { describe, expect, it, vi } from 'vitest';

import { ConsolePublisher } from '../src/feed/publisher';

describe('publisher', () => {
  it('publishes to console', async () => {
    const logMock = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    try {
      // Arrange
      const publisher = new ConsolePublisher();
      const msg = { message: 'foo', author: 'atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep' };

      // Act
      await publisher.publish(msg);

      // Assert
      expect(console.log).toBeCalledWith(JSON.stringify(msg));
    } finally {
      logMock.mockRestore();
    }
  });
});
