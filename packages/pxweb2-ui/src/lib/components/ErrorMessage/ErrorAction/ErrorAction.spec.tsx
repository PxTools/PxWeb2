import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ErrorAction } from './ErrorAction';

vi.mock('react-router', () => ({
  Link: vi.fn(({ to, children, ...props }) => (
    <a href={to.pathname} {...props}>
      {children}
    </a>
  )),
}));

describe('ErrorAction', () => {
  it('renders a button with the correct text when action is "button"', () => {
    const { getByText } = render(
      <ErrorAction action="button" actionText="Retry" />,
    );
    expect(getByText('Retry')).toBeInTheDocument();
  });

  it('renders a link with the correct text when action is "link"', () => {
    const { getByText } = render(
      <ErrorAction action="link" actionText="Go to homepage" />,
    );
    expect(getByText('Go to homepage')).toBeInTheDocument();
  });
});
