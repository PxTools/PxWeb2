import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import NotFoundPage from './NotFoundPage';

// Mock the internal components
vi.mock('../../components/Header/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));
vi.mock('../../components/ErrorMessage', () => ({
  ErrorMessage: () => <div data-testid="error-message">ErrorMessage</div>,
}));

describe('NotFoundPage', () => {
  it('should render successfully', () => {
    const { container } = render(<NotFoundPage />);

    expect(container.firstChild).toBeTruthy();
  });

  it('should render the header', () => {
    const { getByTestId } = render(<NotFoundPage />);

    expect(getByTestId('header')).toBeInTheDocument();
  });

  it('should render the error message', () => {
    const { getByTestId } = render(<NotFoundPage />);

    expect(getByTestId('error-message')).toBeInTheDocument();
  });
});
