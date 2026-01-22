import { FileDetails } from '../models/fileDetails';
import { InputFileCreationService } from './inputFileCreation';
import { DbService } from './dbService';
import { generateA8DigitReference, generateBatchNumber } from '../utils/random';

export class GbcNfService {
  private readonly inputCreator = new InputFileCreationService();
  private dbService?: DbService;

  async createNfFileXif(
    fileDetails: FileDetails,
    options?: { skipDb?: boolean }
  ): Promise<void> {
    fileDetails.batchNumber = generateBatchNumber();
    fileDetails.partnerReference = generateA8DigitReference();

    await this.inputCreator.createGbcNfFile(fileDetails);

    if (!options?.skipDb) {
      if (!this.dbService) this.dbService = new DbService();
      await this.dbService.setProcessAndFileStatusToNotStarted(fileDetails);
    }
  }

  getDbService(): DbService {
    if (!this.dbService) this.dbService = new DbService();
    return this.dbService;
  }
}
