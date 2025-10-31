import process from 'node:process';

import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  PG_URI: string;
  PUBLICATION_NAMES: string[];
  SLOT_NAME: string;
  REPLAY_POSTS: boolean;
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
    PG_URI: process.env.PG_URI,
    PUBLICATION_NAMES: process.env.PUBLICATION_NAMES.split(','),
    SLOT_NAME: process.env.SLOT_NAME,
    REPLAY_POSTS: process.env.REPLAY_POSTS === 'true',
  };

  return config;
}
