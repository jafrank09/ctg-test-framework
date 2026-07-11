import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ContactPage } from '../pages/ContactPage';
import { AboutPage } from '../pages/AboutPage';
import { LabsPage } from '../pages/LabsPage';
import { TrustPage } from '../pages/TrustPage';

type PageFixtures = {
  homePage: HomePage;
  contactPage: ContactPage;
  aboutPage: AboutPage;
  labsPage: LabsPage;
  certificationsPage: TrustPage;
  contractVehiclesPage: TrustPage;
};

/**
 * Extends the base Playwright `test` with one fixture per page object, so specs
 * ask for `{ contactPage }` etc. instead of constructing POMs by hand in every test.
 */
export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
  aboutPage: async ({ page }, use) => {
    await use(new AboutPage(page));
  },
  labsPage: async ({ page }, use) => {
    await use(new LabsPage(page));
  },
  certificationsPage: async ({ page }, use) => {
    await use(new TrustPage(page, '/certifications'));
  },
  contractVehiclesPage: async ({ page }, use) => {
    await use(new TrustPage(page, '/contract-vehicles'));
  },
});

export { expect } from '@playwright/test';
