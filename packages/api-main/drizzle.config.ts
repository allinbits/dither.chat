import process from 'node:process';
import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config();

export default defineConfig({
  out: './drizzle/migrations',
  schema: './drizzle/schema.ts',
  dialect: 'postgresql',
  verbose: true,
  strict: true,
  dbCredentials: {
    url: process.env.PG_URI!,
  },
  tablesFilter: ['!pg_*', '!information_schema.*'], // Exclude system tables
});
