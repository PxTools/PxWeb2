import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { GenericError } from './GenericError';
import { renderWithProviders } from '../../../util/testing-utils';

// Mock the internal components
vi.mock('../ErrorLayout', () => ({
  ErrorLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-layout">{children}</div>
  ),
}));
vi.mock('../../ErrorMessage/ErrorMessage', () => ({
  ErrorMessage: () => <div data-testid="error-message">ErrorMessage</div>,
}));
vi.mock('../../Header/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

describe('GenericError', () => {
  it('should render successfully', () => {
    const { container } = renderWithProviders(<GenericError />);

    expect(container.firstChild).toBeTruthy();
  });

  it('should render the error layout', () => {
    const { getByTestId } = renderWithProviders(<GenericError />);

    expect(getByTestId('error-layout')).toBeInTheDocument();
  });

  it('should render the error message', () => {
    const { getByTestId } = renderWithProviders(<GenericError />);

    expect(getByTestId('error-message')).toBeInTheDocument();
  });
});
