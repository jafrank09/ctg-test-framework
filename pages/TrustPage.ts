import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Certifications and Contract Vehicles are structurally identical "static trust content"
 * pages (a heading plus supporting body content/badges), so one parameterized class
 * covers both instead of two near-duplicate page objects.
 */
export class TrustPage extends BasePage {
  readonly path: string;
  readonly heading: Locator;
  readonly contentImages: Locator;

  constructor(page: Page, path: string) {
    super(page);
    this.path = path;
    this.heading = page.getByRole('heading', { level: 1 });
    this.contentImages = page.locator('main img');
  }

  async goto() {
    await super.goto(this.path);
  }
}
