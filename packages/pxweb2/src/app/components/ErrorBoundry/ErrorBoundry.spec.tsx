import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import ErrorBoundary from './ErrorBoundry';

// Mock the Header component
vi.mock('../Header/Header', () => ({
  Header: () => <div role="banner">Mock Header</div>,
}));

// Mock the Alert component
vi.mock('@pxweb2/pxweb2-ui', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => (
    <div role="alert">{children}</div>
  ),
}));

describe('ErrorBoundary', () => {
  // Setup console mocks before all tests
  let consoleErrorSpy: any;
  let consoleLogSpy: any;

  beforeAll(() => {
    // Suppress React error logging and component console.log
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
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

    // Assert that the child component is rendered
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('handles a mocked error correctly', () => {
    // Mock a function that throws an error
    const mockThrowError = vi.fn(() => {
      throw new Error('Mocked error');
    });

    // Use the mock function in a component
    const ErrorComponent = () => {
      mockThrowError();
      return null;
    };

    // Render the ErrorBoundary with the ErrorComponent
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    );

    // Assert that the fallback UI is rendered
    expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
    expect(screen.getByRole('alert')).toHaveTextContent('Mocked error'); // Alert with error message

    // Assert that the mock function was called
    expect(mockThrowError).toHaveBeenCalled();
  });
});
