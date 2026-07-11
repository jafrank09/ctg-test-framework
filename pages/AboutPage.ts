import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AboutPage extends BasePage {
  /** Every team member photo, leadership and general staff alike (`.executive-card` and `.employee-container`). */
  readonly teamMemberImages: Locator;

  constructor(page: Page) {
    super(page);
    this.teamMemberImages = page.locator('.executive-card img, .employee-container img');
  }

  async goto() {
    await super.goto('/about');
  }
}
