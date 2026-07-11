import { Page, Locator } from '@playwright/test';

/**
 * Shared header/nav behavior present on every page of the site.
 * Page-specific classes extend this rather than duplicating nav locators.
 *
 * The header has two dropdown toggles ("Capabilities" and "About"), both built from the
 * same Mantine Menu component (role="menu" / role="menuitem"), so one generic
 * open/read mechanism covers both instead of duplicating locators per toggle.
 */
export class BasePage {
  readonly page: Page;
  readonly logo: Locator;
  readonly desktopNav: Locator;
  readonly dropdown: Locator;
  readonly mobileMenuButton: Locator;
  readonly mobileNav: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.getByRole('link', { name: 'Capital Technology Group logo' });
    this.desktopNav = page.locator('.nav-items');
    this.dropdown = page.getByRole('menu');
    this.mobileMenuButton = page.getByRole('button', { name: 'Navigation Menu' });
    // The mobile drawer is a separate Mantine AppShell Navbar slot, not a toggled
    // copy of .nav-items, so it needs its own locator to scope link clicks against
    // (the footer repeats several of the same link labels further down the page).
    this.mobileNav = page.locator('.mantine-AppShell-navbar');
  }

  async goto(path: string = '/') {
    await this.page.goto(path, { waitUntil: 'networkidle' });
  }

  /** The top-level nav toggle/link with the given label, e.g. "Capabilities" or "About". */
  navToggle(label: string): Locator {
    return this.desktopNav.getByRole('link', { name: label });
  }

  /** Opens a header dropdown ("Capabilities" or "About") and waits for its menu to render. */
  async openDropdown(label: string) {
    await this.navToggle(label).click();
    await this.dropdown.waitFor({ state: 'visible' });
  }

  /** A link inside the currently-open dropdown, by its visible label. */
  dropdownLink(name: string): Locator {
    return this.dropdown.getByRole('menuitem', { name });
  }

  async openMobileMenu() {
    await this.mobileMenuButton.click();
  }
}
