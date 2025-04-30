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
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Child Component</div>
      </ErrorBoundary>,
    );

    // Assert that the child component is rendered
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  // it('renders fallback UI when an error occurs', () => {
  //   // Suppress React error logging
  //   const consoleErrorSpy = vi
  //     .spyOn(console, 'error')
  //     .mockImplementation(() => {});

  //   // Create a component that throws an error
  //   const ErrorComponent = () => {
  //     throw new Error('Test error');
  //   };

  //   // Render the ErrorBoundary with the ErrorComponent
  //   render(
  //     <ErrorBoundary>
  //       <ErrorComponent />
  //     </ErrorBoundary>,
  //   );

  //   // Assert that the fallback UI is rendered
  //   expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
  //   expect(screen.getByRole('alert')).toHaveTextContent('Test error'); // Alert with error message

  //   // Restore the console.error mock
  //   consoleErrorSpy.mockRestore();
  // });

  // it('logs the error to the console', () => {
  //   // Spy on console.log
  //   const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  //   // Create a component that throws an error
  //   const ErrorComponent = () => {
  //     throw new Error('Test error');
  //   };

  //   // Render the ErrorBoundary with the ErrorComponent
  //   render(
  //     <ErrorBoundary>
  //       <ErrorComponent />
  //     </ErrorBoundary>,
  //   );

  //   // Assert that the error was logged
  //   expect(consoleSpy).toHaveBeenCalledWith(
  //     expect.any(Error),
  //     expect.objectContaining({ componentStack: expect.any(String) }),
  //   );

  //   // Restore the console.log mock
  //   consoleSpy.mockRestore();
  // });
});
