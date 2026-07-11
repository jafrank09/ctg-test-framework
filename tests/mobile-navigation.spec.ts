import { test, expect } from '../fixtures/pages';

/**
 * Assumption: some prospects might look at this sight on their phone. A broken responsive nav is a dead-end for mobile visitors.
 * If the hamburger menu doesn't work, a phone visitor has no way to navigate anywhere
 * beyond the page they land on. This is a common, easy-to-miss regression issue
 * (CSS breakpoint changes) since most manual dev/QA checking happens on desktop.
 */
test.describe('Mobile responsive navigation', () => {
  test('hamburger menu replaces the desktop nav and its links work', async ({ page, homePage }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await homePage.goto();

    await expect(homePage.desktopNav).toBeHidden();
    await expect(homePage.mobileMenuButton).toBeVisible();

    await homePage.openMobileMenu();
    await expect(homePage.mobileNav).toBeVisible();

    // Scoped to the mobile nav specifically - the footer repeats several of the same
    // link labels further down the page, which would otherwise make this ambiguous.
    await homePage.mobileNav.getByRole('link', { name: 'Labs', exact: true }).click();

    await expect(page).toHaveURL(/\/labs$/);
  });
});
