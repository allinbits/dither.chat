import { mergeTests, test } from '@playwright/test';

import { testWithDither } from './dither.fixture';
import { testWithKeplr } from './keplr.fixture';

const base = mergeTests(testWithKeplr, testWithDither);

export const baseTest = base.extend<{
  connectWallet: () => Promise<void>;
}>({
  connectWallet: async ({ homePage, keplrPopup }, use) => {
    await use(async () => {
      await test.step('Navigate to home page', async () => {
        await homePage.page.waitForTimeout(1500);
        await homePage.navigate();
      });

      await new Promise(r => setTimeout(r, 3000));

      await test.step('Open wallet connection dialog', async () => {
        const walletDialog = await homePage.openConnectWalletDialog();
        await walletDialog.selectKeplrWallet();
      });

      await new Promise(r => setTimeout(r, 3000));
      await test.step('Unlock Keplr wallet', async () => {
        await keplrPopup.invoke(async (k) => {
          await k.page.waitForTimeout(5000);
          await k.unlockWallet();
          // try {
          //   await k.approveConnection();
          // } catch {
          //   //
          // }
        });
      });

      await keplrPopup.invoke(async (k) => {
        await k.page.waitForTimeout(5000);
        if (await k.approveSignatureScreenLocator.isVisible()) {
          await k.approveSignature();
        }
      });
    });
  },
});
