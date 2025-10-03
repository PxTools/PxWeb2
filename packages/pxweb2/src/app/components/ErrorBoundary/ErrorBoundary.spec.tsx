import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import ErrorBoundary from './ErrorBoundary';

// Mock the error components
vi.mock('../Errors/GenericError/GenericError', () => ({
  GenericError: () => (
    <div data-testid="generic-error">Generic Error Component</div>
  ),
}));

vi.mock('../Errors/NotFound/NotFound', () => ({
  NotFound: () => <div data-testid="not-found">Not Found Component</div>,
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

  it('renders NotFound when a 404 error occurs', () => {
    const ErrorComponent = () => {
      throw new Error('404 Not Found');
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('not-found')).toBeInTheDocument();
    expect(screen.getByText('Not Found Component')).toBeInTheDocument();
    expect(screen.queryByTestId('generic-error')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Generic Error Component'),
    ).not.toBeInTheDocument();
  });

  it('renders GenericError when a non-404 error occurs', () => {
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
    expect(screen.queryByTestId('not-found')).not.toBeInTheDocument();
    expect(screen.queryByText('Not Found Component')).not.toBeInTheDocument();
  });
});
