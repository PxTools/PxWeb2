import { vi, Mock } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { useRouteError, useLocation } from 'react-router';

import { ErrorPage } from './ErrorPage';
import { getConfig } from '../../util/config/getConfig';
import { renderWithProviders } from '../../util/testing-utils';

vi.mock('../../util/config/getConfig');
vi.mock('react-router', () => ({
  useRouteError: vi.fn(),
  useLocation: vi.fn(),
  Link: vi.fn(({ to, children, ...props }) => (
    <a href={to.pathname} {...props}>
      {children}
    </a>
  )),
}));

describe('ErrorPage', () => {
  const mockError = {
    status: 404,
    statusText: 'Not Found',
    message: 'The requested resource was not found.',
    data: 'Additional error data',
  };
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
    vi.resetAllMocks();

    // Default mocks
    (useRouteError as Mock).mockReturnValue(mockError);
    (useLocation as Mock).mockReturnValue(mockLocation);
    (getConfig as Mock).mockReturnValue(mockConfig);
  });
  it('renders without crashing', () => {
    const { baseElement } = renderWithProviders(<ErrorPage />);

    expect(baseElement).toBeTruthy();
  });

  it('displays the error message', () => {
    const { getByText } = renderWithProviders(<ErrorPage />);

    expect(
      getByText(
        '404 Not Found The requested resource was not found. Additional error data',
      ),
    ).toBeInTheDocument();
  });
});
