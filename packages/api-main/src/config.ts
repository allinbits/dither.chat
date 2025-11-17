import process from 'node:process';

import dotenv from 'dotenv';

dotenv.config();

type JWT_STRICTNESS = boolean | 'lax' | 'strict' | 'none' | undefined;

interface Config {
  PORT: number;
  PG_URI: string;
  AUTH: string;
  JWT: string;
  JWT_STRICTNESS: JWT_STRICTNESS;
  DISCORD_WEBHOOK_URL: string;
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

  if (!process.env.AUTH || process.env.AUTH === 'default') {
    throw new Error(`AUTH must be set to a strong secret`);
  }

  if (!process.env.JWT) {
    console.error(`Failed to specify JWT, no JWT secret provided`);
    throw new Error(`JWT must be set to a strong secret`);
  }

  if (typeof process.env.JWT_STRICTNESS === 'undefined') {
    console.warn(`JWT_STRICTNESS not set, defaulting to lax`);
    process.env.JWT_STRICTNESS = 'lax';
  }

  if (typeof process.env.DISCORD_WEBHOOK_URL === 'undefined') {
    console.warn(`DISCORD_WEBHOOK_URL not set, defaulting to empty`);
    process.env.DISCORD_WEBHOOK_URL = '';
  }

  config = {
    PORT: process.env.PORT ? Number.parseInt(process.env.PORT) : 3000,
    PG_URI: process.env.PG_URI,
    AUTH: process.env.AUTH as string,
    JWT: process.env.JWT as string,
    JWT_STRICTNESS: process.env.JWT_STRICTNESS as JWT_STRICTNESS,
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
  };

  return config;
}
