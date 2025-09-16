import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { NotFound } from './NotFound';

// Mock the internal components
vi.mock('../ErrorLayout', () => ({
  ErrorLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-layout">{children}</div>
  ),
}));
vi.mock('../../ErrorMessage', () => ({
  ErrorMessage: () => <div data-testid="error-message">ErrorMessage</div>,
}));

describe('NotFound', () => {
  it('should render successfully', () => {
    const { container } = render(<NotFound />);

    expect(container.firstChild).toBeTruthy();
  });

  it('should render the error layout', () => {
    const { getByTestId } = render(<NotFound />);

    expect(getByTestId('error-layout')).toBeInTheDocument();
  });

  it('should render the breadcrumbs', () => {
    const { container } = render(<NotFound />);

    expect(container.textContent).toContain('Breadcrumbs component here:');
  });

  it('should render the error message', () => {
    const { getByTestId } = render(<NotFound />);

    expect(getByTestId('error-message')).toBeInTheDocument();
  });
});
