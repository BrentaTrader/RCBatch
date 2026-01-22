import { Page } from '@playwright/test';
import path from 'path';
import { loadScenarioData } from '../data/testData';
import { FileDetails } from '../models/fileDetails';
import { GbcNfService } from './gbcNfService';
import { HangfireJobsPage } from '../pages/hangfire-jobs.page';

export class GbcOrchestrator {
  async runGbcAllProvinceHappyPath(page: Page, scenarioId: string, client: string, sampleFileName: string): Promise<FileDetails> {
    const fileDetails = loadScenarioData(scenarioId);
    const localSample = path.resolve(process.cwd(), 'src', 'data', client, sampleFileName);
    fileDetails.sampleFile = localSample;
    fileDetails.client = client;
    fileDetails.fileInfo = client;
    fileDetails.scenarioId = scenarioId;

    const gbcNfService = new GbcNfService();
    await gbcNfService.createNfFileXif(fileDetails);

    const db = gbcNfService.getDbService();
    const hangfirePage = new HangfireJobsPage(page);
    await hangfirePage.goToHFJobs(db, fileDetails);

    console.log(`File uploaded to SFTP with Batchnumber ${fileDetails.batchNumber}, filename ${fileDetails.inputFileName} and PartnerReference ${fileDetails.partnerReference}`);

    return fileDetails;
  }
}