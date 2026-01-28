import { DownloadPage } from '../pages/download.page';
import { Page } from '@playwright/test';
import path from 'path';
import { loadScenarioData } from '../data/testData';
import { FileDetails } from '../models/fileDetails';
import { GbcNfService } from './gbcNfService';
import { HangfireJobsPage } from '../pages/hangfire-jobs.page';
import { processManualTransaction } from './processManualTransaction';
import { ExcelHelper } from '../utils/excelHelper';

export class GbcOrchestrator {
  async runGbcAllProvinceHappyPath(page: Page, scenarioId: string, client: string, sampleFileName: string, testName: string = 'GBC_AllProvinceHappyPath'): Promise<FileDetails> {
    const fileDetails = loadScenarioData(scenarioId);
    const localSample = path.resolve(process.cwd(), 'src', 'data', client, sampleFileName);
    fileDetails.sampleFile = localSample;
    fileDetails.client = client;
    fileDetails.fileInfo = client;
    fileDetails.scenarioId = scenarioId;

    const gbcNfService = new GbcNfService();

    // Create NF file and set OrderId in fileDetails as a side effect
    await gbcNfService.createNfFileXif(fileDetails);

    const db = gbcNfService.getDbService();
    const hangfirePage = new HangfireJobsPage(page);
    await hangfirePage.goToHFJobs(db, fileDetails);

    // Call manual processing API for YT jurisdiction
    const manualResponse = await processManualTransaction(fileDetails, 'YT', 'superuser');
    console.log('Manual Processing API response:', manualResponse);

    // Download and verify summary report after manual processing
    const downloadPage = new DownloadPage(page);
    await downloadPage.setDownloadCriteria(fileDetails);
    // You may want to set the download directory dynamically or use a config value
    const downloadDir = process.env.PW_DOWNLOADS_DIR || path.resolve(process.cwd(), 'downloads');
    await downloadPage.downloadAndVerify(fileDetails, downloadDir, testName);
    ExcelHelper.verifyImportedSuccessfullyGreaterThanZero(
      path.join(process.cwd(), 'artifacts', testName, fileDetails.summaryReportFileName!)
    );
    console.log('Summary report file downloaded and verified:', fileDetails.summaryReportFileName);

    await db.setProcessAndFileStatusToNotStartedReturn(fileDetails);
    await hangfirePage.goToHFJobsForReturnFile(db, fileDetails);
fileDetails.downloadFileType = 'ReturnFile';
    await downloadPage.setDownloadCriteria(fileDetails);
    await downloadPage.downloadAndVerify(fileDetails, downloadDir, testName);
    console.log(`File processed with Batchnumber ${fileDetails.batchNumber}, filename ${fileDetails.inputFileName}  PartnerReference ${fileDetails.partnerReference} and OrderId ${fileDetails.orderId}`);

    return fileDetails;
  }
}