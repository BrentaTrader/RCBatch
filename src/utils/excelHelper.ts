import * as XLSX from 'xlsx';
import { expect } from '@playwright/test';

export class ExcelHelper {
  static verifyImportedSuccessfullyGreaterThanZero(filePath: string) {
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      throw new Error(`Excel file not found at path: ${filePath}`);
    }
    const workbook = XLSX.readFile(filePath);
    const sheetName = 'Imported by Province Summary';
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found in Excel file`);
    }

    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, {
      defval: '',
    });

    const grandTotalRow = jsonData.find(
      row => row['Province'] === 'GrandTotal'
    );

    if (!grandTotalRow) {
      throw new Error('GrandTotal row not found in sheet');
    }

    const importedSuccessfully =
      Number(grandTotalRow['Imported Successfully']);

    console.log(
      'GrandTotal - Imported Successfully:',
      importedSuccessfully
    );

    expect(importedSuccessfully).toBeGreaterThan(0);
  }
}
