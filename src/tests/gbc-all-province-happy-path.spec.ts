import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { loadEnv } from '../config/env';
import { GbcOrchestrator } from '../services/gbcOrchestrator';

test.describe('GBC All Province Happy Path', () => {
  test('GBC NF smoke', async ({ page }) => {
    const env = loadEnv();
    const loginPage = new LoginPage(page);
    await loginPage.goto(env.webAppUrl);
    await loginPage.login(env.adminUser, env.adminPassword);
    console.log('Logged into web application');

    const scenarioId = 'GBC_AllProvinceHappyPath';
    const orchestrator = new GbcOrchestrator();
    const fileDetails = await orchestrator.runGbcAllProvinceHappyPath(page, scenarioId, 'GBC', 'GBC_NF.XIF');

    expect(fileDetails.uniqueId).toBeTruthy();
  });
});
