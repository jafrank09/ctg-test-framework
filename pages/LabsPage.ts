import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export type ExternalLink = { text: string; href: string };

export class LabsPage extends BasePage {
  /** Every external ("_blank") link in the main content — live demos, GitHub repos, docs, social. */
  readonly externalLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.externalLinks = page.locator('main a[target="_blank"]');
  }

  async goto() {
    await super.goto('/labs');
  }

  /** Returns the unique {text, href} pairs behind every external link, for driving reachability checks. */
  async externalLinkTargets(): Promise<ExternalLink[]> {
    // Grab text + href for every matched anchor in one pass inside the browser context.
    const rawLinks = await this.externalLinks.evaluateAll((anchors) =>
      anchors.map((a) => ({ text: a.textContent?.trim() ?? '', href: a.getAttribute('href') ?? '' }))
    );

    // Labs cards reuse labels like "GitHub" and "Documentation" across projects, and the footer's
    // social links can repeat too, so dedupe by href to avoid checking the same URL twice.
    const uniqueLinks: ExternalLink[] = [];
    const seenHrefs = new Set<string>();
    for (const link of rawLinks) {
      if (!link.href || seenHrefs.has(link.href)) continue;
      seenHrefs.add(link.href);
      uniqueLinks.push(link);
    }

    return uniqueLinks;
  }
}
