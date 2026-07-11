import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export type ContactFormData = {
  name: string;
  organization: string;
  email: string;
  phone: string;
  message: string;
};

export class ContactPage extends BasePage {
  readonly sendMessageButton: Locator;
  readonly successHeading: Locator;
  private readonly fields: Record<keyof ContactFormData, Locator>;

  constructor(page: Page) {
    super(page);
    this.fields = {
      name: page.getByLabel('Name', { exact: true }),
      organization: page.getByLabel('Organization', { exact: true }),
      email: page.getByLabel('Email Address', { exact: true }),
      phone: page.getByLabel('Phone Number', { exact: true }),
      message: page.getByLabel('Message', { exact: true }),
    };
    this.sendMessageButton = page.getByRole('button', { name: 'Send Message' });
    this.successHeading = page.getByRole('heading', { name: 'Success!' });
  }

  async goto() {
    await super.goto('/contact-us');
  }

  field(name: keyof ContactFormData): Locator {
    return this.fields[name];
  }

  /** Clears every form field, regardless of current value. */
  async clearAll() {
    for (const locator of Object.values(this.fields)) {
      await locator.clear();
    }
  }

  /** Clears then fills only the fields present in `data`, so partial payloads work for validation-gap tests. */
  async fill(data: Partial<ContactFormData>) {
    for (const [name, value] of Object.entries(data) as [keyof ContactFormData, string][]) {
      const locator = this.fields[name];
      await locator.clear();
      await locator.fill(value);
    }
  }

  async submit() {
    await this.sendMessageButton.click();
  }
}
