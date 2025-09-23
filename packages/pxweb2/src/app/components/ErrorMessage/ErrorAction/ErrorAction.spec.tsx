import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ErrorAction } from './ErrorAction';

const mockNavigate = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));
vi.mock('@pxweb2/pxweb2-ui', () => ({
  Button: vi.fn(({ children, onClick, variant, size }) => (
    <button onClick={onClick} data-variant={variant} data-size={size}>
      {children}
    </button>
  )),
}));

describe('ErrorAction', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('when action is "button"', () => {
    it('renders Button component with correct props and text', () => {
      const { getByRole } = render(
        <ErrorAction action="button" actionText="Retry" align="center" />,
      );
      const button = getByRole('button');

      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Retry');
      expect(button).toHaveAttribute('data-variant', 'primary');
      expect(button).toHaveAttribute('data-size', 'medium');
    });

    it('calls navigate(0) when clicked', () => {
      const { getByRole } = render(
        <ErrorAction action="button" actionText="Retry" align="center" />,
      );

      fireEvent.click(getByRole('button'));

      expect(mockNavigate).toHaveBeenCalledWith(0);
    });
  });

  describe('when action is "link"', () => {
    it('renders native button element with correct text', () => {
      const { getByRole } = render(
        <ErrorAction action="link" actionText="Go back" align="start" />,
      );
      const button = getByRole('button');

      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Go back');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('calls navigate(-1) when clicked', () => {
      const { getByRole } = render(
        <ErrorAction action="link" actionText="Go back" align="start" />,
      );

      fireEvent.click(getByRole('button'));

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('applies center alignment class when align is "center"', () => {
      const { getByRole } = render(
        <ErrorAction action="link" actionText="Go back" align="center" />,
      );

      const button = getByRole('button');

      expect(button.className).toContain('link');
      expect(button.className).toContain('alignCenter');
    });

    it('applies start alignment class when align is "start"', () => {
      const { getByRole } = render(
        <ErrorAction action="link" actionText="Go back" align="start" />,
      );
      const button = getByRole('button');

      expect(button.className).toContain('link');
      expect(button.className).toContain('alignStart');
    });
  });
});
