import { Page, Locator, Download } from '@playwright/test';
import path from 'path';
import { FileDetails } from '../models/fileDetails';
import { loadEnv } from '../config/env';

const env = loadEnv();

export class DownloadFilePage {
  private readonly corporationDropdown: Locator;
  private readonly fileTypeDropdown: Locator;
  private readonly goButton: Locator;
  private readonly searchInput: Locator;
  private readonly downloadIcon: Locator;

  constructor(private readonly page: Page) {
    this.corporationDropdown = page.locator("//mat-select[@formcontrolname='corportionid']");
    this.fileTypeDropdown = page.locator("//mat-select[@formcontrolname='filetype']");
    this.goButton = page.locator("//button[@type='submit']");
    this.searchInput = page.locator("//input[@placeholder='Search']");
    this.downloadIcon = page.locator(
      "//ngx-datatable//datatable-body-cell//fa-icon[@icon='download']"
    );
  }

  private async selectOption(dropdown: Locator, optionText: string): Promise<void> {
    await dropdown.click();
    await this.page.locator(`//mat-option//span[normalize-space()='${optionText}']`).click();
  }

  async setFilters(fileDetails: FileDetails): Promise<void> {
    await this.selectOption(this.corporationDropdown, fileDetails.client);
    await this.selectOption(this.fileTypeDropdown, fileDetails.downloadFileType);
    await this.goButton.click();
  }

  async downloadClientFile(fileDetails: FileDetails): Promise<void> {
    await this.setFilters(fileDetails);
    if (fileDetails.inputFileName) {
      await this.searchInput.fill(fileDetails.inputFileName);
    }
    const download = await this.waitForDownload();
    fileDetails.summaryReportFileName = download.suggestedFilename();
    const downloadPath = await download.path();
    if (downloadPath) {
      const target = path.join(env.downloadDirectory, fileDetails.summaryReportFileName);
      await download.saveAs(target);
      fileDetails.downloadFilePath = target;
    }
  }

  async downloadReturnFile(fileDetails: FileDetails): Promise<void> {
    await this.setFilters(fileDetails);
    const download = await this.waitForDownload();
    fileDetails.returnFileName = download.suggestedFilename();
    const downloadPath = await download.path();
    if (downloadPath) {
      const target = path.join(env.downloadDirectory, fileDetails.returnFileName);
      await download.saveAs(target);
      fileDetails.downloadFilePath = target;
    }
  }

  private async waitForDownload(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadIcon.first().click();
    return downloadPromise;
  }
}
