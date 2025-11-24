import type { Page } from '@playwright/test';

import { ConnectWalletDialogPage } from './connect-wallet-dialog.pom';

export class HomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto('/');
    await this.page.waitForLoadState();
  }

  async openNewPostDialog() {
    await this.page.getByRole('button', { name: 'New post' }).click();
  }

  async openConnectWalletDialog() {
    await this.page.getByRole('button', { name: 'Connect Wallet' }).click();
    return new ConnectWalletDialogPage(this.page);
  }
}
