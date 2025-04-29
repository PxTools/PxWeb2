import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ErrorPage } from './ErrorPage';
import { renderWithProviders } from '../../util/testing-utils';

// Mock React Router - only need to mock this once
vi.mock('react-router', () => ({
  MemoryRouter: vi.fn().mockImplementation(({ children }) => children),
  useRouteError: vi.fn().mockReturnValue({
    status: 404,
    statusText: 'Not Found',
    message: 'The requested resource was not found.',
    data: 'Additional error data',
  }),
  useLocation: vi.fn().mockReturnValue({
    pathname: '/en/table/tab638',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  }),
  Link: vi.fn(({ to, children }) => <a href={to}>{children}</a>),
}));

vi.mock('../../util/config/getConfig', () => ({
  getConfig: vi.fn(() => ({
    language: {
      supportedLanguages: [
        { shorthand: 'en', languageName: 'English' },
        { shorthand: 'no', languageName: 'Norwegian' },
      ],
    },
  })),
}));

describe('ErrorPage', () => {
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
