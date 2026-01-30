import { Page } from '@playwright/test';
import path from 'path';
import { FileDetails } from '../models/fileDetails';
import { NfService } from './nfService';
import { HangfireJobsPage } from '../pages/hangfire-jobs.page';
import { DownloadPage } from '../pages/download.page';
import { ExcelHelper } from '../utils/excelHelper';
import { loadScenarioData } from '../data/testData';
import { processManualTransaction } from './processManualTransaction';

export class BnsCommOrchestrator {
  async runBnsCommHappyPathNF(page: Page, scenarioId: string): Promise<FileDetails> {
    const fileDetails = loadScenarioData(scenarioId);
    // Use provided sample file under repo
    fileDetails.sampleFile = path.resolve(process.cwd(), 'src', 'data', 'BNS_COMM', 'BNS_Comm_NF.xml');
    fileDetails.scenarioId = scenarioId;

    if (!fileDetails.inputFileDescription) {
      throw new Error(`InputFileDescription is missing in TestData.xlsx for scenario ${scenarioId}.`);
    }

    const service = new NfService();
    await service.createBnsCommNfXml(fileDetails);

    const db = service.getDbService();
    const hangfirePage = new HangfireJobsPage(page);
    await hangfirePage.goToHFJobs(db, fileDetails);

    // manual processing similar to GBC
    const manualResponse = await processManualTransaction(fileDetails, 'BC', 'superuser');
    console.log('Manual Processing API response:', manualResponse);

    const downloadPage = new DownloadPage(page);
    await downloadPage.setDownloadCriteria(fileDetails);
    const downloadDir = process.env.PW_DOWNLOADS_DIR || path.resolve(process.cwd(), 'downloads');
    const testName = scenarioId;
    if (!fileDetails.returnFileDescription) {
      throw new Error(
        `ReturnFileDescription is missing in TestData.xlsx for scenario ${scenarioId}. ` +
        `Please add it so DB can resolve the Return UniqueId.`
      );
    }
    await db.setProcessAndFileStatusToNotStartedReturn(fileDetails);
    await hangfirePage.waitForHangfireReady();
    await hangfirePage.disableStickyHeader();
    await hangfirePage.goToHFJobsForReturnFile(db, fileDetails);
fileDetails.downloadFileType = 'ReturnFile';
    await downloadPage.setDownloadCriteria(fileDetails);
    await downloadPage.downloadAndVerify(fileDetails, downloadDir, testName);
    // Validate that PartnerReference is present in the return file
    const fs = await import('fs');
    if (!fileDetails.returnFileName || !fileDetails.partnerReference) {
      throw new Error('Return file name or partner reference is not set in fileDetails.');
    }
    const returnFilePath = path.join(process.cwd(), 'artifacts', testName, fileDetails.returnFileName);
    let found = false;
    for (const line of fs.readFileSync(returnFilePath, 'utf-8').split(/\r?\n/)) {
      if (line.includes(fileDetails.partnerReference)) {
        found = true;
        break;
      }
    }
    if (!found) {
      throw new Error(`${fileDetails.partnerReference} not present in Return File ${fileDetails.returnFileName  }`);
    }
    console.log(`PartnerReference ${fileDetails.partnerReference} found in Return File ${fileDetails.returnFileName}`);
    console.log(`File processed with Batchnumber ${fileDetails.batchNumber}, filename ${fileDetails.inputFileName}  PartnerReference ${fileDetails.partnerReference} and OrderId ${fileDetails.orderId}`);

    return fileDetails;
  }
}
