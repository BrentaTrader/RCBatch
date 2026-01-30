import path from 'path';
import { loadEnv } from '../config/env';
import { FileDetails } from '../models/fileDetails';
import { copyFile, ensureDirectory, clearDirectory, updateBatchNumberInXifFile, updatePartnerReferenceInXifFile } from '../utils/fileSystem';
import { generateBatchNumber, generateA8DigitReference } from '../utils/random';
import { DbService } from './dbService';

const env = loadEnv();

function formatAdjustedTimestamp(): string {
  const d = new Date(Date.now() - 10 * 60 * 1000); // minus 10 minutes
  const pad2 = (n: number) => n.toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  const MM = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const HH = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  const f = Math.floor(d.getMilliseconds() / 100); // single fractional digit
  return `_${yyyy}-${MM}-${dd}_${HH}-${mm}-${ss}_${f}`;
}

export class BnsCommNfService {
  private dbService?: DbService;

  async createNfFileXml(fileDetails: FileDetails): Promise<FileDetails> {
    const scenarioArtifactsDir = path.join(process.cwd(), 'artifacts', fileDetails.scenarioId);
    await ensureDirectory(scenarioArtifactsDir);

    const inputFileName = `xifdoc${formatAdjustedTimestamp()}.XML`;
    const localFilePath = path.join(scenarioArtifactsDir, inputFileName);
    await copyFile(fileDetails.sampleFile, localFilePath);

    // Generate and update identifiers
    fileDetails.batchNumber = generateBatchNumber();
    fileDetails.partnerReference = generateA8DigitReference();
    await updateBatchNumberInXifFile(localFilePath, fileDetails.batchNumber);
    await updatePartnerReferenceInXifFile(localFilePath, fileDetails.partnerReference);

    fileDetails.inputFileName = inputFileName;

    // Upload to SFTP BNSCommercial/BNSXML
    const targetPath = path.join(env.sftpRoot, 'BNSCommercial', 'BNSXML', inputFileName);
    const targetDir = path.dirname(targetPath);
    await ensureDirectory(targetDir);
    await clearDirectory(targetDir);
    await copyFile(localFilePath, targetPath);

    // Prepare DB statuses
    await this.getDbService().setProcessAndFileStatusToNotStarted(fileDetails);
    return fileDetails;
  }

  getDbService(): DbService {
    if (!this.dbService) this.dbService = new DbService();
    return this.dbService;
  }
}
