2# CTG Ready · Automated Test Suite

Playwright + TypeScript test suite for [capitaltg.com](https://www.capitaltg.com), built as if establishing coverage from scratch for a professional-services / federal GovCon consultancy - not a SaaS product or e-commerce site.

## Setup & Running Tests

```bash
npm install
npx playwright install chromium   # add --with-deps on Linux/CI
```

Run everything (Chromium only - see note below):

```bash
npx playwright test --project=chromium
```

Run a single spec:

```bash
npx playwright test tests/navigation.spec.ts --project=chromium
```

Interactive UI mode (time-travel debugging, per-test re-runs):

```bash
npx playwright test --ui
```

View the HTML report after a run:

```bash
npx playwright show-report
```

**Important:** `tests/contact-form.spec.ts` performs a **real submission** to `hello@capitaltg.com` through the site's live reCAPTCHA + Lambda backend, using clearly-labeled test-safe data from `test-data/contact-form.json` (name/message explicitly say "please disregard and delete"). No real personal data is used, per the assignment constraints. 

## Architecture

- `pages/` - Page Object Model. `BasePage` holds the shared header/nav (both dropdown menus use one generic `openDropdown(label)` mechanism, since "Capabilities" and "About" are the same underlying Mantine `Menu` component). Page-specific classes (`HomePage`, `ContactPage`, `AboutPage`, `LabsPage`, `TrustPage`) extend it.

- `fixtures/pages.ts` - extends Playwright's `test` with one fixture per page object, so specs ask for `{ contactPage }` etc. instead of constructing POMs by hand.

- `test-data/*.json` - contact form inputs and nav link/path mappings live here, not inline in specs, so they can be updated in one place as the business changes without touching test logic.

- `tests/utils/images.ts` - one shared helper (`loadedImageStates`) for the "images have alt text and actually loaded" check, reused by the About roster and Certifications badge tests.

- Everything runs on stock `@playwright/test` - no additional HTTP/assertion libraries. External link reachability checks use Playwright's built-in `request` fixture. There are many excellent helper libraries out there, but a good framework should leverage it's own well-vetted, secure tooling as much as possible.

18 tests across 6 spec files, all currently passing on Chromium.

## Scenario Justification & Prioritization

CTG is a professional services firm with no cart, product, or self-serve signup - "business value" here seems to mean **pipeline generation** (visits → contacts → contracts) and **credibility signals** a federal buyer checks before engaging. I've ranked test Scenarios  by that lens, NOT by visual prominence.

### 1. Contact form (`contact-form.spec.ts`) - highest priority
The ONLY conversion point on the entire site (unless I missed one) and the actual revenue funnel; every page carries a persistent "Contact us" CTA pointing here. Two tests:

- **Real end-to-end submission** with valid data, asserting the "Success!" confirmation actually renders. This exercises the full path including Google reCAPTCHA v2 and the AWS Lambda endpoint it posts to - not just that a form exists.

- **Documents a known gap**: the form has no client-side validation at all 
(confirmed by probing - empty and malformed-email submissions never flag `aria-invalid` or render an error). This is written as a characterization test (documents current behavior) rather than an assertion of desired behavior.

### 2. Primary navigation (`navigation.spec.ts`) - 11 tests
The 5 capability pages seem akin to CTG's "product catalog" for a services firm. A broken link here means a prospect can't reach the service line they came looking for. I've covered the Capabilities dropdown (5 links), the About dropdown, Our Team, Contact Us, Contract Vehicles, Certifications , and the two direct top-level links (Our Work, Labs).

### 3. About page team roster (`about-team.spec.ts`)
For a relationship-driven Government contractor, "I've heard of that firm, I think someone I know worked/works for them" is a real trust signal in a way it wouldn't be for a SaaS product - this page, to me, is an important credibility asset. We check that the name & photo pairing renders correctly across the whole roster (70+ people). We are checking the section is visible.

### 4. Labs external links (`labs-external-links.spec.ts`)
CTG Labs page contains links to open-source projects (live demos, GitHub repos, docs) and are the closest thing to a conventional software 'product' a technical evaluator can kick the tires on. 

We deliberately check *reachability only* (HTTP status via Playwright's `request` fixture) rather than fully navigating and asserting on GitHub/demo content - we shouldn't be QA'ing third-party sites we don't own. Link targets are read live from the page rather than hardcoded, so a new Labs project is covered automatically.

### 5. Trust & credibility pages (`trust-pages.spec.ts`)
 I'm assuming these certifications (ISO 9001/20000/27001, CMMI) and Contract Vehicles (NAICS codes, corporate info) aren't trivial for a federal contractor - a contracting officer probably checks these before considering CTG. Stale or broken content may have a direct bid-eligibility consequence.

### 6. Mobile navigation (`mobile-navigation.spec.ts`) - lowest priority of the six
A broken responsive nav is a hard dead-end for mobile visitors (no way to navigate beyond the landing page), and it's a common, easy-to-miss regression class since most manual checking happens on desktop. Included last because, unlike 1-5, it's a general web-quality concern rather than something specific to this business.

### Scenarios considered but not automated
- **Careers / Greenhouse handoff** - internal hiring funnel, not customer-facing revenue. Scoped out deliberately; would reconsider if the business flagged recruiting pipeline as a current priority.

- **Unknown-route / 404 behavior** - while exploring the site I found that unknown routes (e.g. `/asdf`) silently redirect to the homepage instead of showing a real 404. That's a real finding, but I judged it to be the weakest of the candidate scenarios and cut for time under the 1-2 hour timebox. Validting things fail for the 'right' reason can still be of high value.

- **Blog subdomain** (`blog.capitaltg.com`) - separate application/ownership, I deemed this to be out of scope for this site's suite.

- **Full content QA of third-party sites** (GitHub, external demos) - not ours to test; only reachability is checked. I opted to not go into the rabbit hole of checking third party info given the timeframe, but depending on which of these demos/tools the org deems most valuable, some more bespoke code could be written for this within this framework. 

- **Cross-browser/Edge runs on every iteration** - Firefox and WebKit are wired into `playwright.config.ts` but day-to-day runs targeted Chromium only, partly for speed and partly to avoid tripling real contact-form submissions. Microsoft Edge (I assume at least some federal end users skew towards using windows) is commented out in the config as a fast-follow - see Open Questions.

## Assumptions and Open Questions

**Assumptions made:**
- The public marketing site (no auth/admin areas) is the full intended testing surface, per the assignment constraints.

- Submitting the real contact form with clearly-labeled, test-safe data is acceptable, given the assignment explicitly permits AI assistance and doesn't prohibit form submission (only real personal data and destructive/load testing). A production-grade suite would NEVER do this against a live inbox - see below.

- Nav structure (labels, paths) is stable enough to externalize into `test-data/navigation-links.json`, but page copy (headings, marketing text) is not - confirmed by finding at least one divergence (`/capabilities/data-science` renders "Data Science & AI/ML", not "Data Science"), so navigation assertions check substring/URL matches rather than exact heading text.

- Team roster photos may differ across environments (staff turnover, possibly different asset buckets in a lower/staging env), so the About page test uses a floor count + broken-image check rather than asserting an exact roster.

- Chromium is an acceptable single-browser target for real-submission and day-to-day runs; Firefox/WebKit remain available in config.

**Open questions I'd bring to the team:**

- **Test environment**: is there (or should there be) a staging environment with a sandboxed contact-form endpoint, so this suite can run in CI without hitting the real `hello@capitaltg.com` inbox and real reCAPTCHA scoring on every run? reCAPTCHA passed reliably in local testing, but its scoring is behavior/IP-based, so CI stability isn't guaranteed the same way.

- **Missing client-side validation**: is this intentional? Right now a malformed email address is accepted silently - the lead is submitted, CTG has no way to reply, and no one ever finds out. That's a worse outcome than it looks like at first glance (a lost lead, not just a UX nit). I'd also flag the submit button isn't disabled until required fields are valid - which is basic form-UX standard practice.

- **Unknown-route behavior**: is the silent redirect-to-homepage intentional, or should there be a real 404 page (better for both UX and SEO)?

- **External link check cadence**: should Labs' external link reachability run on the same CI schedule as the rest of the suite, or on a looser cadence (e.g. nightly) since it's checking infrastructure outside CTG's control, and shouldn't block a PR over a third-party blip? This can also potentially help lessen noisy/unclear test feedback.

- **Browser priorities**: given the federal, Windows-heavy user base, is real Microsoft Edge coverage (not just Chromium-as-proxy, since Edge is Chromium-based) worth adding now versus later?

- **Roster check strictness**: is a floor-count acceptable long-term, or does the business want specific leadership photos (executive team) to always resolve, which would need a small, deliberately-maintained data file?

## How I'd Extend or Scale This

- **CI integration**: a GitHub Actions workflow is already scaffolded (`.github/workflows/playwright.yml`); I'd split it into a fast job (nav/UI, every PR) and a slower/nightly job (real contact-form submission, external link checks) so third-party or network flakiness doesn't block every PR.

- **Staging environment target**: parameterize `baseURL` via an environment variable, and push for a sandboxed contact-form backend so validation testing (proper negative-path coverage: bad email formats, missing fields, XSS-safe input handling) can be tested thoroughly without consequence to a real inbox.

- **Accessibility testing**: given the federal/508-compliance-conscious audience, I'd add automated a11y scanning (e.g. `@axe-core/playwright`) as its own scenario - didn't fit this timebox but is a natural, high-value next addition for this specific audience.

- **Unknown-route coverage**: reinstate a dedicated test once the team decides whether the current fallback behavior is intended or a bug to fix.
