import { test, expect } from '../fixtures/pages';

/**
 * Assumption: Some sales could have a relationally drive component at this org. 
 * "I've worked with someone there. My friend is friends with so and so, etc.")
 * If CTG had a standalone SaaS product as its revenue source, this page would likely not matter much to a potential customer.
 * But IF my assumption has any validity, I  think this page, though seemingly not remarkable, might actually be of significant value to prospects.
 * It could be important for signalling trust/credibility within the industry.  
 * This test checks that the name+photo pairing renders correctly for a large part of the current roster,
 * not just a handful of leadership cards.
 */
test.describe('About page team roster', () => {
  test('every team member photo has a name and actually loads', async ({ aboutPage }) => {
    await aboutPage.goto();

    const photos = await aboutPage.teamMemberImages.evaluateAll((imgs) =>
      (imgs as HTMLImageElement[]).map((img) => ({
        alt: img.alt.trim(),
        loaded: img.complete && img.naturalWidth > 0,
      }))
    );

    // This is more of a 'sanity test', not an exact count - any business roster grows/shrinks over time (and often specific
    // photo assets and their S3 links may differ across testing environments), so this only guards against the whole
    // section failing to render. If the org experiences a massive and sudden change in scale, we could adjust the value of 
    //of what we are asserting against in the next line down.

    expect(photos.length).toBeGreaterThanOrEqual(50);

    const missingNames = photos.filter((p) => !p.alt);
    expect(missingNames, 'team photos missing a name (alt text)').toEqual([]);

    const brokenImages = photos.filter((p) => !p.loaded);
    expect(brokenImages, 'team photos that failed to load').toEqual([]);
  });
});
