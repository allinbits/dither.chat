/* eslint-disable no-empty-pattern */
import type { BrowserContext, Page } from '@playwright/test';

import { test as base, chromium } from '@playwright/test';

import { keplrData } from '../config/keplr';
import { KeplrExtensionPage } from '../pom/keplr-extension.pom';

export const testWithKeplr = base.extend<{
  context: BrowserContext;
  extensionId: string;
  keplrPopup: { waitForPopup: () => Promise<KeplrExtensionPage> };
  keplrExtension: KeplrExtensionPage;
}>({
  context: async ({}, use) => {
    const args = [
      `--disable-web-security`,
      '--disable-setuid-sandbox',
      `--disable-extensions-except=${keplrData.extensionPath}`,
      `--load-extension=${keplrData.extensionPath}`,
    ];

    const context = await chromium.launchPersistentContext('./playwright/.user-data', {
      channel: 'chromium',
      recordVideo: {
        dir: 'test-results/videos',
      },
      permissions: ['clipboard-read', 'clipboard-write'],
      devtools: false,
      timeout: 0,
      headless: false,
      bypassCSP: true,
      serviceWorkers: 'allow',
      args,
    });

    await use(context);
    await context.close();
  },

  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();

    if (!background) background = await context.waitForEvent('serviceworker');

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },

  keplrPopup: async ({ context, extensionId }, use) => {
    const waitForPermissionPopup = async (): Promise<KeplrExtensionPage> => {
      return await new Promise((resolve) => {
        function findPermissionPopup(page: Page) {
          if (page.url().includes('popup.html')) {
            const handle = new KeplrExtensionPage(page, extensionId);
            // Reload is required as Keplr popup initially loads with blank content
            page.reload().then(() => resolve(handle));
            return handle;
          }
        }

        const found = context.pages().map(findPermissionPopup).filter(Boolean).length > 0;

        if (!found) {
          context.once('page', findPermissionPopup);
        }
      });
    };

    await use({ waitForPopup: waitForPermissionPopup });
  },

  keplrExtension: async ({ context, extensionId }, use) => {
    const page = await context.newPage();
    const keplrPage = new KeplrExtensionPage(page, extensionId);
    await use(keplrPage);
  },
});
