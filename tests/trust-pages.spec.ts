import { test, expect } from '../fixtures/pages';
import { loadedImageStates } from './utils/images';

/**
 * Assumption: Certifications and Contract Vehicles aren't just marketing verbiage for a federal contractor -
 * a contracting officer likely checks these pages to confirm bid eligibility (ISO/CMMI badges,
 * NAICS codes) before considering CTG for an RFP. 
 * 
 * Stale or broken content here might have a direct consequence on bid-eligibility. Another page that might 'seem'
 * non-essential, but which could derail the sales cycle. 
 */
test.describe('Trust & credibility pages', () => {
  test('Certifications page renders its heading and every badge image loads', async ({ certificationsPage }) => {
    await certificationsPage.goto();
    await expect(certificationsPage.heading).toBeVisible();

    const badges = await loadedImageStates(certificationsPage.contentImages);
    expect(badges.length).toBeGreaterThan(0);

    const missingAlt = badges.filter((b) => !b.alt);
    expect(missingAlt, 'certification badges missing alt text').toEqual([]);

    const brokenBadges = badges.filter((b) => !b.loaded);
    expect(brokenBadges, 'certification badges that failed to load').toEqual([]);
  });

  test('Contract Vehicles page renders its heading and key sections', async ({ contractVehiclesPage, page }) => {
    await contractVehiclesPage.goto();
    await expect(contractVehiclesPage.heading).toBeVisible();

    // This page is plain text (no images) - NAICS codes and corporate info are the two
    // sections a contracting officer would actually look for, so confirm both rendered
    // rather than just checking the page didn't error out.
    await expect(page.getByRole('heading', { name: 'NAICS Codes' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Corporate Information' })).toBeVisible();
  });
});
