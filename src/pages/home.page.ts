import { Page, Locator } from '@playwright/test';

export class HomePage {
  private readonly hangfireMenu: Locator;
  private readonly hangfireJobs: Locator;
  private readonly downloadFile: Locator;

  constructor(private readonly page: Page) {
    this.hangfireMenu = page.locator("//ul/li/a/span[text()='HangFire Dashboard']");
    this.hangfireJobs = page.locator("//ul/li/a/span[text()='Hangfire Jobs']");
    this.downloadFile = page.locator("//ul/li/a/span[text()='Download File']");
  }

  async openHangfireJobs(): Promise<void> {
    await this.hangfireMenu.click();
    await this.hangfireJobs.click();
  }

  async openDownloadFile(): Promise<void> {
    await this.downloadFile.click();
  }
}
