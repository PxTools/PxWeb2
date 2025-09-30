import { ApiError, Problem } from 'packages/pxweb2-api-client/src';

/**
 * Enhanced error class that includes HTTP status code information.
 * This allows error boundaries to handle different types of errors appropriately.
 */
export class ApiProblemError extends Error {
  public readonly status: number;
  public readonly originalError: ApiError;
  public readonly selectedTabId?: string;

  constructor(apiError: ApiError, selectedTabId?: string) {
    const problem: Problem = apiError.body as Problem;
    const status = problem?.status ?? apiError.status;

    const message = `${status}
          ${selectedTabId ? `TableId: ${selectedTabId} ` : ''}
          ${problem?.title}
           - ${problem?.type}`;

    super(message);

    this.name = 'ApiProblemError';
    this.status = status;
    this.originalError = apiError;
    this.selectedTabId = selectedTabId;
  }

  /**
   * Check if this is a client error (4xx status codes)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if this is a server error (5xx status codes)
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Check if this is a specific status code
   */
  hasStatus(statusCode: number): boolean {
    return this.status === statusCode;
  }
}
