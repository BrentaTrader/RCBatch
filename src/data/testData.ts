import path from 'path';
import { FileDetails } from '../models/fileDetails';
import { loadExcelScenarioMap } from '../utils/testDataHelper';

// Base hardcoded scenarios (fallback/defaults)
const baseScenarioMap: Record<string, FileDetails> = {
  TC234283_BMO_AllProvinceHappyPath: {
    scenarioId: 'TC234283_BMO_AllProvinceHappyPath',
    client: 'BMO',
    fileInfo: 'BMO',
    inputFileDescription: 'BMO New Finance Input File',
    sampleFile: path.join(__dirname, 'BMO', 'BMO_AllProvincesWithValidData'),
    downloadFileType: 'ClientSummaryFile',
    returnFileDescription: 'BMO Return File'
  }
};

// Merge Excel-driven scenarios (if present) on top of the base map.
const excelPath = path.resolve(process.cwd(), 'src', 'data', 'TestData.xlsx');
const excelScenarioMap = loadExcelScenarioMap(excelPath);
const scenarioMap: Record<string, FileDetails> = { ...baseScenarioMap, ...excelScenarioMap };

export function loadScenarioData(scenarioId: string): FileDetails {
  const details = scenarioMap[scenarioId];
  if (!details) {
    throw new Error(`Scenario ${scenarioId} is not configured in testData.ts`);
  }
  // Return a deep copy so each test can mutate safely.
  return JSON.parse(JSON.stringify(details));
}
