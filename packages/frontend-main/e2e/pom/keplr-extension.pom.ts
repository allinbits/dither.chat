import type { BrowserContext, Locator, Page } from '@playwright/test';

import { keplrData } from '../config/keplr';

export class KeplrExtensionPage {
  readonly page: Page;
  readonly extensionId: string;
  private readonly approveConnectionScreenLocator: Locator;
  private readonly approveSignatureScreenLocator: Locator;
  private readonly registerScreenLocator: Locator;
  private readonly unlockScreenLocator: Locator;

  readonly popupUrl: string;
  readonly registerUrl: string;

  static async popupFromContext(context: BrowserContext, extensionId: string) {
    const page = await context.newPage();
    const ext = new KeplrExtensionPage(page, extensionId);
    await ext.navigateToPopup();
    return ext;
  }

  constructor(page: Page, extensionId: string) {
    this.page = page;
    this.extensionId = extensionId;

    this.approveConnectionScreenLocator = this.page.getByText('Requesting Connection');
    this.approveSignatureScreenLocator = this.page.getByText('Signature Request');
    this.unlockScreenLocator = this.page.getByText('Welcome Back');
    this.registerScreenLocator = this.page.getByText('Create a new wallet');

    this.popupUrl = `chrome-extension://${this.extensionId}/popup.html`;
    this.registerUrl = `chrome-extension://${this.extensionId}/register.html`;
  }

  async navigateToRegister() {
    await this.page.goto(this.registerUrl);
  }

  async navigateToPopup() {
    await this.page.goto(this.popupUrl);
    await this.page.waitForLoadState();
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

  async unlockWalletIfNeeded() {
    const isVisible = await this.unlockScreenLocator.isVisible();
    if (isVisible) {
      await this.unlockWallet();
    }
    return isVisible;
  }

  async approveConnectionIfNeeded() {
    const isVisible = await this.approveConnectionScreenLocator.isVisible();
    if (isVisible) {
      await this.clickApprove();
    }
    return isVisible;
  }

  async approveSignatureIfNeeded() {
    try {
      const isVisible = await this.approveSignatureScreenLocator.isVisible();
      if (isVisible) {
        await this.clickApprove();
      }
      return isVisible;
    } catch {
      return false;
    }
  }

  async approveSuggestChainIfNeeded() {
    if (this.page.url().includes('popup.html#/suggest-chain')) {
      await this.clickApprove();
    }
  }

  async expectUnlockScreen() {
    await this.unlockScreenLocator.waitFor();
  }

  private async clickApprove() {
    await this.page.getByRole('button', { name: 'Approve' }).click();
  }
}
