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

      const connectPopup = await test.step('Open wallet connection dialog', async () => {
        const walletDialog = await homePage.openConnectWalletDialog();
        await walletDialog.selectKeplrWallet();
        return await keplrPopup.waitForPopup();
      });

      await test.step('Unlock Keplr wallet', async () => {
        await connectPopup.unlockWallet();
      });

      await test.step('Approve connection (if required)', async () => {
        try {
          await connectPopup.approveConnection();
        } catch {
          // Connection already approved
        }
      });

      await test.step('Approve signature request', async () => {
        const approvePopup = await keplrPopup.waitForPopup();
        await approvePopup.approveSignature();
      });
    });
  },
});
