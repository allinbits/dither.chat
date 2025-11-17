import process from 'node:process';

import { defineConfig, devices } from '@playwright/test';

const userDataDir = './playwright/.user-data';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  testMatch: '*.spec.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['html'], ['github'], ['list', { printSteps: true }]] : [['list']],

  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    launchOptions: {
      env: {
        userDataDir,
      },
    },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
    permissions: ['clipboard-read', 'clipboard-write'],
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
      use: {
        launchOptions: {
          env: {
            userDataDir: '',
          },
        },
      },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: true,
  },
});
