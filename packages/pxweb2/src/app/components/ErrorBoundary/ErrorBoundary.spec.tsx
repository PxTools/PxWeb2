import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import ErrorBoundary from './ErrorBoundary';
import { ApiError, Problem } from '@pxweb2/pxweb2-api-client';
import { ApiProblemError } from '../../util/ApiProblemError';

// Mock only the UI components, not the business logic
vi.mock('../Errors/GenericError/GenericError', () => ({
  GenericError: () => (
    <div data-testid="generic-error">Generic Error Component</div>
  ),
}));

vi.mock('../Errors/NotFound/NotFound', () => ({
  NotFound: () => <div data-testid="not-found-error">Not Found Component</div>,
}));

describe('ErrorBoundary', () => {
  // Helper to create a real ApiError instance
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
    const mockApiError = createMockApiError(404, {
      title: 'Not Found',
      type: 'about:blank',
    });
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
    const mockApiError = createMockApiError(500, {
      title: 'Internal Server Error',
      type: 'about:blank',
    });
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

  it('renders NotFound when error message starts with 404 status code', () => {
    const ErrorComponent = () => {
      throw new Error(
        '404\n          TableId: TAB60065 \n          Not Found\n           - https://...',
      );
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('not-found-error')).toBeInTheDocument();
  });

  it('renders NotFound when error message contains 404 pattern', () => {
    const ErrorComponent = () => {
      throw new Error('Request failed with status code 404');
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('not-found-error')).toBeInTheDocument();
  });

  it('renders NotFound when error message contains "not found" keyword', () => {
    const ErrorComponent = () => {
      throw new Error('Table not found in the database');
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('not-found-error')).toBeInTheDocument();
  });

  it('renders GenericError when error message contains 500 keyword', () => {
    const ErrorComponent = () => {
      throw new Error('Server error occurred: 500');
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('generic-error')).toBeInTheDocument();
  });

  it('renders GenericError when error message contains "server error" keyword', () => {
    const ErrorComponent = () => {
      throw new Error('Internal server error occurred');
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('generic-error')).toBeInTheDocument();
  });

  it('renders GenericError when status code in message is out of valid HTTP range', () => {
    const ErrorComponent = () => {
      throw new Error('Invalid status code 999 occurred');
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('generic-error')).toBeInTheDocument();
  });

  it('renders GenericError when error has null state', () => {
    const ErrorComponent = () => {
      throw new Error('Generic error without status');
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('generic-error')).toBeInTheDocument();
  });

  it('renders GenericError when error state is null', () => {
    // This tests the edge case where state.error is null but hasError is true
    // We can simulate this by manually setting the state after component mounts
    const TestWrapper = () => {
      const boundaryRef = React.useRef<ErrorBoundary>(null);

      React.useEffect(() => {
        if (boundaryRef.current) {
          // Force the component into an error state with null error
          boundaryRef.current.setState({ hasError: true, error: null });
        }
      }, []);

      return (
        <ErrorBoundary ref={boundaryRef}>
          <div>Child Component</div>
        </ErrorBoundary>
      );
    };

    render(<TestWrapper />);

    // After the effect runs, it should show the generic error
    expect(screen.getByTestId('generic-error')).toBeInTheDocument();
  });
});
