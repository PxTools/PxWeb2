import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import ErrorBoundary from './ErrorBoundary';

// Mock the GenericError component
vi.mock('../Errors/GenericError/GenericError', () => ({
  GenericError: () => (
    <div data-testid="generic-error">Generic Error Component</div>
  ),
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

  it('renders custom fallback when provided and error occurs', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };
    const customFallback = (
      <div data-testid="custom-fallback">Custom Error UI</div>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    // Assert that the custom fallback is rendered instead of GenericError
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    expect(screen.queryByTestId('generic-error')).not.toBeInTheDocument();
  });
});
