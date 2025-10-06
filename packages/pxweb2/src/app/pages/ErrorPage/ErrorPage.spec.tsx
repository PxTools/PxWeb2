import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { useRouteError, isRouteErrorResponse } from 'react-router';

import { ErrorPage } from './ErrorPage';
import { renderWithProviders } from '../../util/testing-utils';

vi.mock('react-router', () => ({
  isRouteErrorResponse: vi.fn(),
  useRouteError: vi.fn(),
}));

// Mock components used within ErrorPage
vi.mock('../../components/Errors/NotFound/NotFound', () => ({
  NotFound: () => <div data-testid="not-found">Not Found Component</div>,
}));
vi.mock('../../components/Errors/GenericError/GenericError', () => ({
  GenericError: () => (
    <div data-testid="generic-error">Generic Error Component</div>
  ),
}));
vi.mock('../../../i18n/useLocalizeDocumentAttributes', () => ({
  default: vi.fn(),
}));

// Create typed mocks and common mock values
const mockUseRouteError = vi.mocked(useRouteError);
const mockIsRouteErrorResponse = vi.mocked(isRouteErrorResponse);
const mockError = {
  status: 404,
};

describe('ErrorPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockUseRouteError.mockReturnValue(mockError);
    mockIsRouteErrorResponse.mockReturnValue(false);
  });

  it('renders without crashing', () => {
    const { baseElement } = renderWithProviders(<ErrorPage />);

    expect(baseElement).toBeTruthy();
  });

  it('displays the correct error component for 404 errors', () => {
    mockIsRouteErrorResponse.mockReturnValue(true);
    mockUseRouteError.mockReturnValue({ status: 404 });

    const { getByTestId } = renderWithProviders(<ErrorPage />);

    expect(getByTestId('not-found')).toBeInTheDocument();
  });

  it('displays the generic error component for non-404 errors', () => {
    mockIsRouteErrorResponse.mockReturnValue(true);
    mockUseRouteError.mockReturnValue({ status: 500 });

    const { getByTestId } = renderWithProviders(<ErrorPage />);

    expect(getByTestId('generic-error')).toBeInTheDocument();
  });

  it('displays the generic error component when isRouteErrorResponse returns false', () => {
    mockIsRouteErrorResponse.mockReturnValue(false);
    mockUseRouteError.mockReturnValue({ status: 404 });

    const { getByTestId } = renderWithProviders(<ErrorPage />);

    expect(getByTestId('generic-error')).toBeInTheDocument();
  });
});
