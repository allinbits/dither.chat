import process from 'node:process';

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '*.spec.ts',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
  },
  projects: [
    {
      name: 'keplr-download-wallet',
      testMatch: 'e2e/setup/download-wallet.setup.ts',
    },
    {
      name: 'keplr-import-wallet',
      testMatch: 'e2e/setup/import-wallet.setup.ts',
      dependencies: ['keplr-download-wallet'],
    },
    {
      name: 'logged-in',
      testMatch: 'e2e/specs/logged-in/*.spec.ts',
      dependencies: ['keplr-import-wallet'],
    },
    {
      name: 'logged-out',
      testMatch: 'e2e/specs/logged-out/*.spec.ts',
      dependencies: ['logged-in'],
    },
  ],
});
