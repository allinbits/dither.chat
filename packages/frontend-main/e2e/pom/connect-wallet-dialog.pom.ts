import type { Locator, Page } from '@playwright/test';

export class ConnectWalletDialogPage {
  readonly page: Page;
  readonly modalLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modalLocator = this.page.locator('[role=dialog]:has-text("Connect Wallet")');
  }

  async selectKeplrWallet() {
    await this.modalLocator.waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'Keplr Wallet' }).click();
  }
}
