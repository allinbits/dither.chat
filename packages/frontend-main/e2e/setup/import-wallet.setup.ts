import { expect } from '@playwright/test';

import { testWithKeplr as setup } from '../fixtures/keplr.fixture';
import { KeplrExtensionPage } from '../pom/keplr-extension.pom';

setup('imports wallet or verifies existing setup', async ({ keplrExtension, page }) => {
  try {
    await setup.step('Import wallet from seed phrase', async () => {
      await keplrExtension.navigateToRegister();
      await keplrExtension.importWallet();
    });
  } catch {
    await setup.step('Verify wallet already set up', async () => {
      const ext = new KeplrExtensionPage(page, keplrExtension.extensionId);
      await ext.navigateToPopup();
      expect(ext.unlockScreenLocator).toBeVisible();
    });
  }
});
