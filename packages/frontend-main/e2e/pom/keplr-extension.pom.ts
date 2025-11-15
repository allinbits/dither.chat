import type { Page } from '@playwright/test';

import { keplrData } from '../config/keplr';

export class KeplrExtensionPage {
  readonly page: Page;
  readonly extensionId: string;

  constructor(page: Page, extensionId: string) {
    this.page = page;
    this.extensionId = extensionId;
  }

  async navigateToRegister() {
    await this.page.goto(`chrome-extension://${this.extensionId}/register.html`);
  }

  async navigateToPopup() {
    await this.page.goto(`chrome-extension://${this.extensionId}/popup.html`);
    await this.page.waitForLoadState();
  }

  async isUnlockScreen() {
    return this.page.getByText('Welcome Back').isVisible();
  }

  async isApproveConnectionScreen() {
    return this.page.getByText('Requesting Connection').isVisible();
  }

  async isApproveSignatureScreen() {
    return this.page.getByText('Signature Request').isVisible();
  }

  async isRegisterScreen(): Promise<boolean> {
    return this.page.getByText('Create a new wallet').isVisible();
  }

  async unlockWallet() {
    await this.page.getByPlaceholder('Type Your Password').fill(keplrData.account.password);
    await this.page.getByRole('button', { name: 'Unlock' }).click();
  }

  async importWallet() {
    await this.page.getByRole('button', { name: 'Import an existing wallet' }).click();
    await this.page.getByRole('button', { name: 'Use recovery phrase or' }).click();
    await this.page.getByRole('button', { name: '24 words' }).click();

    const phraseWords = keplrData.account.seed.split(' ');

    await this.page.locator(`input[type="password"]`).first().focus();
    for (let i = 0; i < phraseWords.length; i++) {
      await this.page.keyboard.type(phraseWords[i]);
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(150);
    }

    await this.page.getByRole('button', { name: 'Import', exact: true }).click();
    await this.page.getByRole('textbox', { name: 'e.g. Trading, NFT Vault,' }).fill(keplrData.account.name);
    await this.page.locator('input[name="password"]').fill(keplrData.account.password);
    await this.page.locator('input[name="confirmPassword"]').fill(keplrData.account.password);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page.getByRole('button', { name: 'Finish' }).click();
  }

  async approveConnection() {
    await this.isApproveConnectionScreen();
    await this.page.getByRole('button', { name: 'Approve' }).click();
  }

  async approveSignature() {
    await this.isApproveSignatureScreen();
    await this.page.getByRole('button', { name: 'Approve' }).click();
  }
}
