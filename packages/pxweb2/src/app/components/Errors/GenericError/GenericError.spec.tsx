import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { GenericError, GenericErrorTableViewer } from './GenericError';
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
  describe('default variant', () => {
    it('should render successfully', () => {
      const { container } = renderWithProviders(<GenericError />);

      expect(container.firstChild).toBeTruthy();
    });

    it('should render the error layout', () => {
      const { getByTestId } = renderWithProviders(<GenericError />);

      expect(getByTestId('error-layout')).toBeInTheDocument();
    });

    it('should render the header', () => {
      const { getByTestId } = renderWithProviders(<GenericError />);

      expect(getByTestId('header')).toBeInTheDocument();
    });

    it('should render the error message', () => {
      const { getByTestId } = renderWithProviders(<GenericError />);

      expect(getByTestId('error-message')).toBeInTheDocument();
    });
  });

  describe('tableViewer variant', () => {
    it('should render successfully', () => {
      const { container } = renderWithProviders(<GenericErrorTableViewer />);

      expect(container.firstChild).toBeTruthy();
    });

    it('should render the error layout', () => {
      const { getByTestId } = renderWithProviders(<GenericErrorTableViewer />);

      expect(getByTestId('error-layout')).toBeInTheDocument();
    });

    it('should not render the header', () => {
      const { queryByTestId } = renderWithProviders(
        <GenericErrorTableViewer />,
      );

      expect(queryByTestId('header')).not.toBeInTheDocument();
    });

    it('should render the error message', () => {
      const { getByTestId } = renderWithProviders(<GenericErrorTableViewer />);

      expect(getByTestId('error-message')).toBeInTheDocument();
    });
  });
});
