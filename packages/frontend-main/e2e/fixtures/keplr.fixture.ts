import type { BrowserContext } from '@playwright/test';

import { test as base, chromium } from '@playwright/test';

import { keplrData } from '../config/keplr';
import { KeplrExtensionPage } from '../pom/keplr-extension.pom';

export interface KeplrPopupAPI {
  popup: () => Promise<KeplrExtensionPage>;
  invoke: (callback: (page: KeplrExtensionPage) => Promise<any>) => Promise<void>;
}

export const testWithKeplr = base.extend<{
  context: BrowserContext;
  extensionId: string;
  keplrPopup: KeplrPopupAPI;
  keplrExtension: KeplrExtensionPage;
}>({
  context: async ({ launchOptions }, use) => {
    const userDataDir = launchOptions.env?.userDataDir ?? '';
    const args = [
      `--disable-web-security`,
      '--disable-setuid-sandbox',
      `--disable-extensions-except=${keplrData.extensionPath}`,
      `--load-extension=${keplrData.extensionPath}`,
    ];

    const context = await chromium.launchPersistentContext(userDataDir, {
      recordVideo: {
        dir: 'test-results/videos',
      },
      devtools: false,
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
    const openPopup = () => KeplrExtensionPage.popupFromContext(context, extensionId);

    const invoke = async (callback: (page: KeplrExtensionPage) => Promise<void>): Promise<void> => {
      let closed = false;
      const keplrPage = await openPopup();
      keplrPage.page.on('close', () => {
        closed = true;
      });

      await callback(keplrPage);
      await new Promise(r => setTimeout(r, 500));

      if (!closed) {
        await keplrPage.page.close();
      }
    };

    await use({ popup: openPopup, invoke });
  },

  keplrExtension: async ({ context, extensionId }, use) => {
    const page = await context.newPage();
    const keplrPage = new KeplrExtensionPage(page, extensionId);
    await use(keplrPage);
  },
});
