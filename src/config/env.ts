import path from 'path';
import { config } from 'dotenv';

let cachedEnv: EnvConfig | null = null;

export interface EnvConfig {
  webAppUrl: string;
  adminUser: string;
  adminPassword: string;
  dbConnectionString: string;
  sftpRoot: string;
  legacyDataRoot: string;
  downloadDirectory: string;
  cgeApiBaseUrl: string;
  cgeApiUser: string;
}

export function loadEnv(): EnvConfig {
  if (cachedEnv) {
    return cachedEnv;
  }

  config({ path: path.resolve(process.cwd(), '.env') });

  cachedEnv = {
    webAppUrl: process.env.WEB_APP_URL ?? 'http://qa.admin.cd.cge.dhltd.corp',
    adminUser: process.env.ADMIN_USER ?? '',
    adminPassword: process.env.ADMIN_PASSWORD ?? '',
    dbConnectionString: process.env.DB_CONNECTION_STRING ?? '',
    sftpRoot: process.env.SFTP_ROOT ?? '',
    legacyDataRoot:
      process.env.LEGACY_DATA_ROOT ??
      path.resolve(__dirname, '../../../../CD_Batch_5_2_Main/UIPageObjectModel/POMSeleniumTest/Data'),
    downloadDirectory: process.env.DOWNLOAD_DIRECTORY ?? path.resolve(process.cwd(), 'downloads'),
    cgeApiBaseUrl: process.env.CGE_API_BASE_URL ?? 'http://aqa1publicapiwebsvcs.cge.dhltd.corp',
    cgeApiUser: process.env.CGE_API_USER ?? 'superuser'
  };

  return cachedEnv;
}
