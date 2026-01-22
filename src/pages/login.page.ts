import { Page, Locator } from '@playwright/test';

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.locator("//input[@ng-model='email']");
    this.passwordInput = page.locator("//input[@formcontrolname='password']");
    this.signInButton = page.locator("//button/span[text()='Sign in']");
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async login(user: string, password: string): Promise<void> {
    await this.emailInput.fill(user);
    await this.passwordInput.fill(password);
    await Promise.all([
      this.page.waitForURL(/.*/, { waitUntil: 'networkidle' }),
      this.signInButton.click()
    ]);
  }
}
