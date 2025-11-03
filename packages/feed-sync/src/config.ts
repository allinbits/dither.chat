import process from 'node:process';

import dotenv from 'dotenv';

dotenv.config();

type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug';

export interface Config {
  postgresUri: string;
  publicationName: string;
  slotName: string;
  replayPosts: boolean;
  log: {
    level: LogLevel;
  };
  telegram: {
    token: string;
    chatId: string;
  };
}

export const config: Config = {
  postgresUri: process.env.PG_URI || '',
  publicationName: process.env.PUBLICATION_NAME || 'feed_pub',
  slotName: process.env.SLOT_NAME || 'slot1',
  replayPosts: process.env.REPLAY_POSTS === 'true',
  log: {
    level: (process.env.LOG_LEVEL as LogLevel) || 'info',
  },

  // Posts are printed to console when Telegram is not avilable
  telegram: {
    token: process.env.TELEGRAM_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },
};
