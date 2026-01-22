import path from 'path';
import { loadEnv } from '../config/env';
import { FileDetails } from '../models/fileDetails';
import { copyFile, ensureDirectory, updateBatchNumberInXifFile, updatePartnerReferenceInXifFile, clearDirectory } from '../utils/fileSystem';

const env = loadEnv();

function formatTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  let hh = d.getHours();
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  // C# hh is 12-hour; mimic with 12-hour without AM/PM to keep shape
  const hh12 = pad(((hh + 11) % 12) + 1);
  return `${yyyy}${MM}${dd}_${hh12}${mm}${ss}`;
}

function buildGbcFileName(): string {
  return `PPtoDH_${formatTimestamp()}.XIF`;
}

function buildSftpTarget(fileInfo: string, fileName: string): string {
  switch (fileInfo.toUpperCase()) {
    case 'GBC':
      return path.join(env.sftpRoot, 'GBC', 'in', fileName);
    case 'BMO':
      return path.join(env.sftpRoot, 'BMO', 'in', fileName);
    default:
      throw new Error(`Client Format not found for ${fileInfo}`);
  }
}

export class InputFileCreationService {
  async createGbcNfFile(fileDetails: FileDetails): Promise<FileDetails> {
    const scenarioArtifactsDir = path.join(process.cwd(), 'artifacts', fileDetails.scenarioId);
    await ensureDirectory(scenarioArtifactsDir);

    const inputFileName = buildGbcFileName();
    const sourceFilePath = path.join(scenarioArtifactsDir, inputFileName);
    await copyFile(fileDetails.sampleFile, sourceFilePath);

    if (fileDetails.batchNumber) {
      await updateBatchNumberInXifFile(sourceFilePath, fileDetails.batchNumber);
    }

    if (fileDetails.partnerReference) {
      await updatePartnerReferenceInXifFile(sourceFilePath, fileDetails.partnerReference);
    }

    fileDetails.inputFileName = inputFileName;
    const targetPath = buildSftpTarget(fileDetails.fileInfo, inputFileName);
    const targetDir = path.dirname(targetPath);
    await ensureDirectory(targetDir);
    await clearDirectory(targetDir);
    await copyFile(sourceFilePath, targetPath);
    return fileDetails;
  }
}
