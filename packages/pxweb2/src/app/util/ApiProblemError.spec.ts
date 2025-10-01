import { describe, it, expect } from 'vitest';
import { ApiProblemError } from './ApiProblemError';
import { ApiError, Problem } from '@pxweb2/pxweb2-api-client';

describe('ApiProblemError', () => {
  const createMockApiError = (
    status: number,
    problem?: Partial<Problem>,
  ): ApiError => {
    const apiError = Object.create(ApiError.prototype);
    apiError.status = status;
    apiError.url = 'http://test.com';
    apiError.statusText = 'Error';
    apiError.body = {
      status: problem?.status ?? status,
      title: problem?.title ?? 'Test Error',
      type: problem?.type ?? 'test-error-type',
      ...problem,
    } as Problem;
    apiError.request = { method: 'GET', url: 'http://test.com' };
    apiError.name = 'ApiError';
    apiError.message = 'Test error';

    return apiError;
  };

  describe('constructor', () => {
    it('should create error with status from problem body', () => {
      const apiError = createMockApiError(500, { status: 503 });
      const error = new ApiProblemError(apiError);

      expect(error.status).toBe(503);
      expect(error.name).toBe('ApiProblemError');
      expect(error.originalError).toBe(apiError);
    });

    it('should fallback to apiError status when problem status is missing', () => {
      const apiError = createMockApiError(404, { status: undefined });
      const error = new ApiProblemError(apiError);

      expect(error.status).toBe(404);
    });

    it('should include tableId in message when provided', () => {
      const apiError = createMockApiError(400, {
        title: 'Bad Request',
        type: 'validation-error',
      });
      const error = new ApiProblemError(apiError, 'table123');

      expect(error.message).toContain('TableId: table123');
      expect(error.selectedTabId).toBe('table123');
    });

    it('should not include tableId in message when not provided', () => {
      const apiError = createMockApiError(400);
      const error = new ApiProblemError(apiError);

      expect(error.message).not.toContain('TableId');
      expect(error.selectedTabId).toBeUndefined();
    });
  });

  describe('isClientError', () => {
    it('should return true for 4xx status codes', () => {
      expect(new ApiProblemError(createMockApiError(400)).isClientError()).toBe(
        true,
      );
      expect(new ApiProblemError(createMockApiError(404)).isClientError()).toBe(
        true,
      );
      expect(new ApiProblemError(createMockApiError(499)).isClientError()).toBe(
        true,
      );
    });

    it('should return false for non-4xx status codes', () => {
      expect(new ApiProblemError(createMockApiError(399)).isClientError()).toBe(
        false,
      );
      expect(new ApiProblemError(createMockApiError(500)).isClientError()).toBe(
        false,
      );
      expect(new ApiProblemError(createMockApiError(200)).isClientError()).toBe(
        false,
      );
    });
  });

  describe('isServerError', () => {
    it('should return true for 5xx status codes', () => {
      expect(new ApiProblemError(createMockApiError(500)).isServerError()).toBe(
        true,
      );
      expect(new ApiProblemError(createMockApiError(503)).isServerError()).toBe(
        true,
      );
      expect(new ApiProblemError(createMockApiError(599)).isServerError()).toBe(
        true,
      );
    });

    it('should return false for non-5xx status codes', () => {
      expect(new ApiProblemError(createMockApiError(499)).isServerError()).toBe(
        false,
      );
      expect(new ApiProblemError(createMockApiError(600)).isServerError()).toBe(
        false,
      );
      expect(new ApiProblemError(createMockApiError(404)).isServerError()).toBe(
        false,
      );
    });
  });

  describe('hasStatus', () => {
    it('should return true when status matches', () => {
      const error = new ApiProblemError(createMockApiError(404));

      expect(error.hasStatus(404)).toBe(true);
    });

    it('should return false when status does not match', () => {
      const error = new ApiProblemError(createMockApiError(404));

      expect(error.hasStatus(500)).toBe(false);
      expect(error.hasStatus(200)).toBe(false);
    });
  });
});
