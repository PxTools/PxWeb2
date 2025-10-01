import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import ErrorBoundary from './ErrorBoundary';
import { ApiProblemError } from '../../util/ApiProblemError';

// Mock the GenericError component
vi.mock('../Errors/GenericError/GenericError', () => ({
  GenericError: () => (
    <div data-testid="generic-error">Generic Error Component</div>
  ),
}));

// Mock the NotFound component
vi.mock('../Errors/NotFound/NotFound', () => ({
  NotFound: () => <div data-testid="not-found-error">Not Found Component</div>,
}));

// Mock the ApiProblemError class
vi.mock('../../util/ApiProblemError', () => ({
  ApiProblemError: class MockApiProblemError extends Error {
    status: number;
    originalError: unknown;
    selectedTabId?: string;

    constructor(apiError: { status: number }, selectedTabId?: string) {
      super('Mock API Problem Error');
      this.name = 'ApiProblemError';
      this.status = apiError.status;
      this.originalError = apiError;
      this.selectedTabId = selectedTabId;
    }

    hasStatus(statusCode: number): boolean {
      return this.status === statusCode;
    }
  },
}));

describe('ErrorBoundary', () => {
  // Setup console mocks before all tests
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    // Suppress React error logging and component console.log
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
  });

  afterAll(() => {
    // Restore console mocks
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  beforeEach(() => {
    // Clear mock history between tests
    consoleErrorSpy.mockClear();
    consoleLogSpy.mockClear();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Child Component</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('renders GenericError when an error occurs', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('generic-error')).toBeInTheDocument();
    expect(screen.getByText('Generic Error Component')).toBeInTheDocument();
  });

  it('renders NotFound component when ApiProblemError with 404 status occurs', () => {
    const mockApiError = {
      status: 404,
      url: 'test-url',
      statusText: 'Not Found',
      body: { status: 404, title: 'Not Found', type: 'about:blank' },
      request: {},
    } as unknown as ApiProblemError['originalError'];

    const ErrorComponent = () => {
      throw new ApiProblemError(mockApiError, 'test-table-id');
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    // Assert that the NotFound component is rendered instead of GenericError
    expect(screen.getByTestId('not-found-error')).toBeInTheDocument();
    expect(screen.getByText('Not Found Component')).toBeInTheDocument();
    expect(screen.queryByTestId('generic-error')).not.toBeInTheDocument();
  });

  it('renders GenericError when ApiProblemError with non-404 status occurs', () => {
    const mockApiError = {
      status: 500,
      url: 'test-url',
      statusText: 'Internal Server Error',
      body: {
        status: 500,
        title: 'Internal Server Error',
        type: 'about:blank',
      },
      request: {},
    } as unknown as ApiProblemError['originalError'];

    const ErrorComponent = () => {
      throw new ApiProblemError(mockApiError, 'test-table-id');
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    // Assert that the GenericError component is rendered, not NotFound
    expect(screen.getByTestId('generic-error')).toBeInTheDocument();
    expect(screen.getByText('Generic Error Component')).toBeInTheDocument();
    expect(screen.queryByTestId('not-found-error')).not.toBeInTheDocument();
  });
});
