import type { Config } from '@atomone/chronostate/dist/types';

import process from 'node:process';

let config: Config & {
  AUTH: string;
  ECLESIA_GRAPHQL_ENDPOINT?: string;
  ECLESIA_GRAPHQL_SECRET?: string;
};

export function useConfig(): typeof config {
  if (typeof config !== 'undefined') {
    return config;
  }

  if (!process.env.AUTH || process.env.AUTH === 'default') {
    console.error(`Failed to specify AUTH, no authorization secret provided`);
    throw new Error(`AUTH must be set to a strong secret`);
  }

  config = {
    API_URLS: process.env.API_URLS ? process.env.API_URLS.split(',') : [],
    MEMO_PREFIX: process.env.MEMO_PREFIX,
    BATCH_SIZE: process.env.BATCH_SIZE ? Number.parseInt(process.env.BATCH_SIZE) : 50,
    START_BLOCK: process.env.START_BLOCK ?? '0',
    RECEIVER: process.env.RECEIVER,
    SENDER: process.env.SENDER,
    LOG: process.env.LOG === 'true',
    AUTH: process.env.AUTH,

    ECLESIA_GRAPHQL_ENDPOINT: process.env.ECLESIA_GRAPHQL_ENDPOINT,
    ECLESIA_GRAPHQL_SECRET: process.env.ECLESIA_GRAPHQL_SECRET,
  };

  return config;
}
