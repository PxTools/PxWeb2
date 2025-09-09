import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import NotFoundPage from './NotFoundPage';

// Mock the Header component
vi.mock('../../components/Header/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

// Mock the ErrorMessage component
vi.mock('@pxweb2/pxweb2-ui', () => ({
  ErrorMessage: () => (
    <div data-testid="error-message">
      <h1>Test error title</h1>
      <p>Test error description</p>
    </div>
  ),
}));

describe('NotFoundPage', () => {
  it('should render successfully', () => {
    const { container } = render(<NotFoundPage />);

    expect(container.firstChild).toBeTruthy();
  });

  it('should render the error message', () => {
    const { getByTestId, getByText } = render(<NotFoundPage />);

    expect(getByTestId('error-message')).toBeInTheDocument();
    expect(getByText(/Test error title/i)).toBeInTheDocument();
    expect(getByText(/Test error description/i)).toBeInTheDocument();
  });
});
