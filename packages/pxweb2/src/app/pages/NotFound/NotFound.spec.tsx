import { describe, it, expect, vi, Mock } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';
import { useLocation } from 'react-router';

import { renderWithProviders } from '../../util/testing-utils';
import { getConfig } from '../../util/config/getConfig';
import { NotFound } from './NotFound';

vi.mock('../../util/config/getConfig');
vi.mock('react-router', () => ({
  useLocation: vi.fn(),
  Link: vi.fn(({ to, children, ...props }) => (
    <a href={to.pathname} {...props}>
      {children}
    </a>
  )),
}));

describe('NotFound should render correctly', () => {
  const mockLocation = {
    pathname: '/en/table/tab638',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  };
  const mockConfig = {
    language: {
      supportedLanguages: [
        { shorthand: 'en', languageName: 'English' },
        { shorthand: 'no', languageName: 'Norwegian' },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    (useLocation as Mock).mockReturnValue(mockLocation);
    (getConfig as Mock).mockReturnValue(mockConfig);
  });

  it('with page_not_found type', () => {
    renderWithProviders(<NotFound type="page_not_found" />);

    expect(
      screen.getByText(/not_found.page_not_found.title/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/not_found.page_not_found.description/i),
    ).toBeInTheDocument();
  });

  it('with unsupported_language type', () => {
    renderWithProviders(<NotFound type="unsupported_language" />);

    expect(
      screen.getByText(/not_found.unsupported_language.title/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/not_found.unsupported_language.description/i),
    ).toBeInTheDocument();
  });
});
