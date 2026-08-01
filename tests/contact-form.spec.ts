import { test, expect } from '../fixtures/pages';
import contactFormData from '../test-data/contact-form.json';

/**
 * Assumption: The contact form is the only 'conversion point' on the site based on what I have found, and for a 
 * lead-gen professional services firm, this is key to the entire revenue funnel. As such, testing- this form
 * is of extremely high business value, and should be an early & high priority for testing prioritization.
 */
test.describe('Contact form', () => {
  // Skipped by default: this is a REAL end-to-end submission (real email sent through the live
  // contact form, no sandbox/dummy routing exists yet - see note below). Kept in the suite
  // intentionally rather than deleted; remove `.skip` to run it deliberately.
  test.skip('submits successfully with valid data and shows a success confirmation', async ({ contactPage }) => {
    //Note: this is a REAL end-to-end submission, so I have opted to give this test a bit more 'breathing room' than the default timeout before treating it as failed.
    //playwright allows for extremely fine-grained control over test timeouts, from the global level, down to the level of individual tests and even individual steps within a test.
    //a good test automation framework uses that flexability from the outset rather than relying on a single, global timeout
    
    //Additinally, I want to call out that in a more polished testing framework, we would have different non production environments setup to route
    //ANY email traffic to a dummy/sandbox account (or seperate service which manages them), which we can write tests to check and  assert against later, if needed.
    //I have opted not to build out that kind of testing in this exericse.
    //BUT I do want to point out that it would be a necessity in any real business's QA process.
    test.setTimeout(45_500);

    await contactPage.goto();
    await contactPage.fill(contactFormData.valid);
    await contactPage.submit();

    await expect(contactPage.successHeading).toBeVisible({ timeout: 45_000 });
    await expect(contactPage.page.getByText("We've received your message")).toBeVisible();
  });

  test('documents a known gap: invalid email format is not flagged client-side', async ({ contactPage }) => {
    // No submission here - this only checks field-level validation, so it
    // doesn't trigger a second live submission through reCAPTCHA/Lambda.
    await contactPage.goto();

    const emailField = contactPage.field('email');
    await emailField.fill(contactFormData.invalidEmail.email);
    await emailField.blur();

    // Current site behavior: no inline error appears for a malformed email.
    // This test documents what I believe is a GAP in the current site behavior, rather than asserting desired behavior -
    // see README "Assumptions and Open Questions".
    await expect(emailField).toHaveAttribute('aria-invalid', 'false');
    await expect(contactPage.page.locator('.mantine-InputWrapper-error')).toHaveCount(0);
  });
});
