import fs from 'fs/promises';
import { Page } from '@playwright/test';
import { FileDetails } from '../models/fileDetails';
import { NfFileService } from './nfFileService';
import { DbService } from './dbService';
import { HangfireWorkflow } from './hangfireWorkflow';

export class FeatureGbcService {
  private readonly nfFileService = new NfFileService();
  private readonly dbService = new DbService();
  private readonly hangfireWorkflow = new HangfireWorkflow(this.dbService);

  async createNfFileTilde(fileDetails: FileDetails): Promise<void> {
    await this.nfFileService.createNfFileTilde(fileDetails);
    await this.dbService.setProcessAndFileStatusToNotStarted(fileDetails);
  }

  async runAllProvinceHappyPath(page: Page, fileDetails: FileDetails): Promise<void> {
    await this.hangfireWorkflow.runAllProvinceHappyPath(page, fileDetails);
  }

  async prepareReturnFile(fileDetails: FileDetails): Promise<void> {
    fileDetails.downloadFileType = 'ReturnFile';
    await this.dbService.setProcessAndFileStatusToNotStartedReturn(fileDetails);
  }

  async runReturnFileFlow(page: Page, fileDetails: FileDetails): Promise<void> {
    await this.hangfireWorkflow.runReturnFileFlow(page, fileDetails);
  }

  async validateRefNumInReturnFile(fileDetails: FileDetails): Promise<void> {
    if (!fileDetails.downloadFilePath || !fileDetails.partnerReference) {
      throw new Error('Return file path or partner reference missing for validation.');
    }
    const content = await fs.readFile(fileDetails.downloadFilePath, 'utf-8');
    if (!content.includes(fileDetails.partnerReference)) {
      throw new Error(
        `${fileDetails.partnerReference} was not found in ${fileDetails.downloadFilePath}`
      );
    }
  }

  getDbService(): DbService {
    return this.dbService;
  }
}
