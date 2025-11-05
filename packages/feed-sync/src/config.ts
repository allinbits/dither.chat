import process from 'node:process';

import dotenv from 'dotenv';

dotenv.config();

type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug';

export interface Config {
  // PostgreSQL URI where posts are stored.
  // Format: postgres://USERNAME:PASSWORD@HOST:PORT/DATABASE
  postgresUri: string;

  // Configures PostgreSQL logical replication.
  // By default 'slot1' is used to subscribe to 'feed_pub' publication.
  publicationName: string;
  slotName: string;

  // Configures log level, which by default is info.
  logLevel: LogLevel;

  // Publishes existing posts to Telegram on start when enabled.
  // By default all existing posts are published, unless both
  // from hash and timestamp are specified, in which case only
  // existing posts starting from these replay values are published.
  replay: {
    enabled: boolean;
    fromHash?: string;
    fromTimestamp?: string;
  };

  // Posts are published to Telegram when token and chat ID are
  // configured, otherwise posts are only printed to console.
  telegram: {
    token?: string;
    chatId?: string;
  };
}

export const config: Config = {
  postgresUri: process.env.PG_URI || '',
  publicationName: process.env.PUBLICATION_NAME || 'feed_pub',
  slotName: process.env.SLOT_NAME || 'slot1',
  logLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
  replay: {
    enabled: process.env.REPLAY_POSTS === 'true',
    fromHash: process.env.REPLAY_FROM_HASH,
    fromTimestamp: process.env.REPLAY_FROM_TIMESTAMP,
  },
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
};
