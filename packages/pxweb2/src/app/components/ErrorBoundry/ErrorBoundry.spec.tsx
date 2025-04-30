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
});
