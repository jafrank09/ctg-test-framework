import { test, expect } from '../fixtures/pages';
import { capabilities, aboutDropdownLinks, directNavLinks } from '../test-data/navigation-links.json';

/**
 * Assumption: The 5 capability pages are somewhat akin to a "product catalog" - a broken link
 * here means a prospect can't reach the service line they came looking for, which would provent
 * them from properly evaluating if CTG is a good fit for their needs.
 * 
 * Careers is intentionally excluded from this suite (see README) even though it
 * lives in the same "About" dropdown as some of the links below.
 * 
 * Link/label/path data lives in a seperate test-data/navigation-links.json, I tried to keep this pattern throughout the project.
 * any good engineer understands the value of seperation of concerns, testing data, as much as possible, should be kept seperately from
 * test scripts, which makes it easier and much faster to update in a fast changing biz environment. 
 * 
 * 
 */

test.describe('Capabilities dropdown', () => {
  for (const capability of capabilities) {
    test(`"${capability.name}" opens ${capability.path}`, async ({ homePage, page }) => {
      await homePage.goto();
      await homePage.openDropdown('Capabilities');
      await homePage.dropdownLink(capability.name).click();

      await expect(page).toHaveURL(new RegExp(`${capability.path}$`));
      // Page copy sometimes extends the nav label (e.g. "Data Science" -> "Data Science & AI/ML"),
      // so this checks the heading contains the label rather than matching it exactly.
      await expect(page.getByRole('heading', { level: 1, name: capability.name })).toBeVisible();
    });
  }
});

test.describe('About dropdown', () => {
  for (const link of aboutDropdownLinks) {
    test(`"${link.name}" opens ${link.path}`, async ({ homePage, page }) => {
      await homePage.goto();
      await homePage.openDropdown('About');
      await homePage.dropdownLink(link.name).click();

      await expect(page).toHaveURL(new RegExp(`${link.path}$`));
      // These pages' marketing copy diverges from the nav label (e.g. "Contact Us" -> "We'd
      // Love to Hear From You!"), so this only confirms a real page rendered, not exact text.
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  }
});

test.describe('Direct top-level nav links', () => {
  for (const link of directNavLinks) {
    test(`"${link.name}" opens ${link.path}`, async ({ homePage, page }) => {
      await homePage.goto();
      await homePage.navToggle(link.name).click();

      await expect(page).toHaveURL(new RegExp(`${link.path}$`));
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  }
});
