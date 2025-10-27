import process from 'node:process';

import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  PORT: number;
  PG_URI: string;
  PUBBLICATION_NAMES: string[];
  SLOT_NAME: string;
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
    PORT: process.env.PORT ? Number.parseInt(process.env.PORT) : 3000,
    PG_URI: process.env.PG_URI,
    PUBBLICATION_NAMES: process.env.PUBLICATION_NAMES.split(','),
    SLOT_NAME: process.env.SLOT_NAME,
  };

  return config;
}
