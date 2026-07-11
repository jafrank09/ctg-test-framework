import { test, expect } from '../fixtures/pages';

/**
 * Assumption: For a services firm that links to a number of viewable open source tool sets users can demo/look at code for,
 * CTG Labs's work (live demos, GitHub repos, docs) are somewhat akin
 * to a real product an evaluator can kick the tires on. A dead demo/repo link
 * might undercut a value pitch in a significant way. AS such, I think it's a high priorty to verify these links work
 
 * This test deliberately checks only *reachability* (HTTP status) via Playwright's built-in
 * `request` capabilities, rather than fully navigating and asserting on GitHub/demo page
 * content - we shouldn't be QA'ing third-party sites we don't own. 
 * 
 * 
 * IMPORTANT NOTE: In a more polished setting, we'd want to abstract ALL requests we make in a test into a seperate api service class (similar to the POM files we have here)
 * For the sake of brevity with this exercise, I'm opting to skip that, and simply
 * coding directly in this test script, which ordinarily I would not do. 
 * 
 * Test scripts in a true enterprise framework are ideally for invoking fixtures, methods and doing assertions, NOT creating them from scratch.
 *
 * Link targets are read live from the page (LabsPage.externalLinkTargets) rather than
 * hardcoded, so a new Labs project should be covered automatically. Because the list size is
 * only known at runtime, this is one test with a soft assertion per link (instead of a
 * parameterized test per link), so one dead link doesn't hide the status of the rest.
 */
test.describe('Labs external product links', () => {
  test('every external Labs link (live demos, GitHub repos, docs) is reachable', async ({ labsPage, request }) => {
    await labsPage.goto();
    const links = await labsPage.externalLinkTargets();

    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      let ok = false;
      let statusDescription = 'request failed (network error)';

      try {
        const response = await request.get(link.href, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
          },
          timeout: 15_000,
        });
        ok = response.ok();
        statusDescription = `HTTP ${response.status()}`;
      } catch (error) {
        statusDescription = `network error: ${(error as Error).message}`;
      }

      expect.soft(ok, `"${link.text}" (${link.href}) - ${statusDescription}`).toBeTruthy();
    }
  });
});
