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

      await test.step('Open wallet connection dialog', async () => {
        const walletDialog = await homePage.openConnectWalletDialog();
        await walletDialog.selectKeplrWallet();
      });

      await test.step('Unlock Keplr wallet', async () => {
        await keplrPopup.invoke(async (k) => {
          await k.unlockWalletIfNeeded();
          await k.approveSuggestChainIfNeeded();
        });
      });

      let connApproved = false;
      await test.step('Approve connection or signature', async () => {
        await keplrPopup.invoke(async (k) => {
          connApproved = await k.approveConnectionIfNeeded();
          await k.approveSignatureIfNeeded();
        });
      });

      if (connApproved) {
        await test.step('Approve signature', async () => {
          await keplrPopup.invoke(k => k.approveSignatureIfNeeded());
        });
      }
    });
  },
});
