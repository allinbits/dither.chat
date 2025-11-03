import process from 'node:process';

import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  postgresUri: string;
  publicationNames: string[];
  slotName: string;
  replayPosts: boolean;
  telegram: {
    token: string;
    chatId: string;
  };
}

let config: Config;

export function useConfig(): Config {
  if (typeof config !== 'undefined') {
    return config;
  }

  if (typeof process.env.PG_URI === 'undefined') {
    console.error(`Failed to specify PG_URI, no database uri provided`);
    process.exit(1);
  }

  if (typeof process.env.PUBLICATION_NAMES === 'undefined') {
    console.error(`Failed to specify PUBLICATION_NAMES, no pubblication names provided`);
    process.exit(1);
  }

  if (typeof process.env.SLOT_NAME === 'undefined') {
    console.error(`Failed to specify SLOT_NAME, no slot name provided`);
    process.exit(1);
  }

  config = {
    postgresUri: process.env.PG_URI,
    publicationNames: process.env.PUBLICATION_NAMES.split(','),
    slotName: process.env.SLOT_NAME,
    replayPosts: process.env.REPLAY_POSTS === 'true',
    telegram: {
      token: process.env.TELEGRAM_TOKEN || '',
      chatId: process.env.TELEGRAM_CHAT_ID || '',
    },
  };

  return config;
}
