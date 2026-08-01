import { test, expect } from '../fixtures/pages';
import apiHeaders from '../test-data/api-headers.json';

/**
 * Assumption: For a services firm that links to a number of viewable open source tool sets users can demo/look at code for,
 * CTG Labs's work (live demos, GitHub repos, docs) are somewhat akin
 * to a real product an evaluator can kick the tires on. A dead demo/repo link
 * might undercut a value pitch in a significant way. AS such, I think it's a high priorty to verify these links work
 
 * This test deliberately checks only *reachability* (HTTP status) via the shared
 * `apiService` fixture, rather than fully navigating and asserting on GitHub/demo page
 * content - we shouldn't be QA'ing third-party sites we don't own.
 *
 * Request construction now lives in services/ApiService.ts (the API-layer counterpart to
 * the page objects) instead of inline here - this spec only invokes it and asserts, the
 * same division of labor the UI specs already follow with fixtures/pages.ts.
 *
 * Link targets are read live from the page (LabsPage.externalLinkTargets) rather than
 * hardcoded, so a new Labs project should be covered automatically. Because the list size is
 * only known at runtime, this is one test with a soft assertion per link (instead of a
 * parameterized test per link), so one dead link doesn't hide the status of the rest.
 */
test.describe('Labs external product links', () => {
  test('every external Labs link (live demos, GitHub repos, docs) is reachable', async ({ labsPage, apiService }) => {
    await labsPage.goto();
    const links = await labsPage.externalLinkTargets();

    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      const result = await apiService.get(link.href, {
        // We simply shouldn't need this header here, but keeping it in case a target site
        // does UA-sniffing/bot-blocking on other people's locals or in CI.
        headers: apiHeaders.browserLikeUserAgent,
        timeout: 15_000,
      });

      expect.soft(result.ok, `"${link.text}" (${link.href}) - ${result.statusDescription}`).toBeTruthy();
    }
  });
});
