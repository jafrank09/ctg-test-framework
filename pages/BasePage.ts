import { Page, Locator } from '@playwright/test';

/**
 * Shared header/nav behavior present on every page of the site.
 * Page-specific classes extend this rather than duplicating nav locators.
 */
export class BasePage {
  readonly page: Page;
  readonly logo: Locator;
  readonly desktopNav: Locator;
  readonly capabilitiesToggle: Locator;
  readonly capabilitiesDropdown: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.getByRole('link', { name: 'Capital Technology Group logo' });
    this.desktopNav = page.locator('.nav-items');
    this.capabilitiesToggle = this.desktopNav.getByRole('link', { name: 'Capabilities' });
    this.capabilitiesDropdown = page.getByRole('menu');
    this.mobileMenuButton = page.getByRole('button', { name: 'Navigation Menu' });
  }

  async goto(path: string = '/') {
    await this.page.goto(path, { waitUntil: 'networkidle' });
  }

  /** Opens the desktop "Capabilities" dropdown and returns the link for a given capability. */
  async openCapabilitiesMenu() {
    await this.capabilitiesToggle.click();
    await this.capabilitiesDropdown.waitFor({ state: 'visible' });
  }

  capabilityLink(name: string): Locator {
    return this.capabilitiesDropdown.getByRole('menuitem', { name });
  }

  async openMobileMenu() {
    await this.mobileMenuButton.click();
  }
}
