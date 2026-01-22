# BMO Playwright Migration

Playwright/TypeScript port of the Selenium test `TC234283_BMO_AllProvinceHappyPath`. Only the logic, data, and helpers required by this scenario were migrated.

## Prerequisites

- Node.js 18+
- Access to the legacy data directory so the sample file `BMO_AllProvincesWithValidData` can be reused.
- Network access to the CGE QA SQL Server, SFTP share, and Manual Processing API.

## Setup

```bash
cd "Playwright Batch/bmo-playwright"
npm install
copy .env.example .env # update secrets as needed
```

## Running the test

```bash
npx playwright test
```

Use `npx playwright test --headed` to observe the browser run.

## Project layout

```
src/
  config/      # env + constant helpers
  data/        # scenario-specific metadata
  models/      # TS models (file details, lien, etc.)
  pages/       # Playwright page objects
  services/    # File, DB, Hangfire, manual processing helpers
  utils/       # Shared utilities (fs, random values)
tests/
  bmo-all-province-happy-path.spec.ts  # migrated test case
  gbc-all-province-happy-path.spec.ts  # GBC NF smoke test (XIF)
```

## Excel-driven Test Data

- Source file: [src/data/TestData.xlsx](src/data/TestData.xlsx)
- Loader: [src/utils/testDataHelper.ts](src/utils/testDataHelper.ts) reads the first sheet and maps rows to the `FileDetails` shape used by tests.
- Merge behavior: Excel rows override the defaults defined in [src/data/testData.ts](src/data/testData.ts) when `scenarioId` matches.
- Expected columns (case-insensitive): `scenarioId`, `client`, `fileInfo`, `inputFileDescription`, `sampleFile`, `downloadFileType`, `returnFileDescription`. Optional fields are also supported (dates, flags, renewal/discharge/COP file descriptions, etc.).

## GBC NF Smoke Test

- Sample file lives in-repo at: [src/data/GBC/GBC_NF.XIF](src/data/GBC/GBC_NF.XIF)
- The test [src/tests/gbc-all-province-happy-path.spec.ts](src/tests/gbc-all-province-happy-path.spec.ts) explicitly overrides the scenario's `sampleFile` to this local copy for stability.
- The service creates a timestamped XIF, updates batch number if present, and copies it to the SFTP share under `GBC/in`.
- The test performs a minimal smoke assertion that the file exists at `SFTP_ROOT/GBC/in/<generatedName>.XIF`.

Environment variables (set in `.env`):

- `SFTP_ROOT`: UNC or local path to the SFTP share root (e.g., `\\cms_uat_ftp_non_pci.dhltd.corp\cms_uat_ftp_non_pci\CMSUATNONPCI\Usr\cgecd_qa2`).
- `DB_CONNECTION_STRING`: SQL Server connection string used by DB helpers.
- `LEGACY_DATA_ROOT`: Base path for legacy sample files; not required for the GBC smoke test since it uses the repo sample.

Run just the smoke test:

```bash
npx playwright test -g "GBC All Province Happy Path"
```
