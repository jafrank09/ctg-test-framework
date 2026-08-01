import { APIRequestContext, request as playwrightRequest } from '@playwright/test';

export type ApiCallResult = {
  ok: boolean;
  status: number | null;
  statusDescription: string;
};

export type ApiServiceOptions = {
  baseURL?: string;
  extraHTTPHeaders?: Record<string, string>;
};

export type ApiCallOptions = {
  headers?: Record<string, string>;
  data?: unknown;
  timeout?: number;
};

/**
 * API-layer counterpart to the page objects: tests ask for it via a fixture instead of
 * creating/disposing a request context themselves. Every call resolves to an ApiCallResult
 * rather than throwing on a non-2xx or network failure, so callers decide (like the Labs
 * spec does) whether a given check should be a hard `expect` or a soft `expect.soft` per link.
 */
export class ApiService {
  private constructor(private readonly context: APIRequestContext) {}

  /** Async because `request.newContext()` is async - unlike the page objects, this can't be a plain constructor. */
  static async create(options: ApiServiceOptions = {}): Promise<ApiService> {
    const context = await playwrightRequest.newContext({
      baseURL: options.baseURL,
      extraHTTPHeaders: options.extraHTTPHeaders,
    });
    return new ApiService(context);
  }

  async dispose() {
    await this.context.dispose();
  }

  async get(url: string, options?: ApiCallOptions): Promise<ApiCallResult> {
    return this.call('GET', url, options);
  }

  async post(url: string, options?: ApiCallOptions): Promise<ApiCallResult> {
    return this.call('POST', url, options);
  }

  /** Single place that turns a verb + url into a normalized result, so every call site gets identical network-error handling. */
  private async call(method: 'GET' | 'POST', url: string, options?: ApiCallOptions): Promise<ApiCallResult> {
    try {
      const response = await this.context.fetch(url, {
        method,
        headers: options?.headers,
        data: options?.data,
        timeout: options?.timeout,
      });
      return { ok: response.ok(), status: response.status(), statusDescription: `HTTP ${response.status()}` };
    } catch (error) {
      return { ok: false, status: null, statusDescription: `network error: ${(error as Error).message}` };
    }
  }
}
