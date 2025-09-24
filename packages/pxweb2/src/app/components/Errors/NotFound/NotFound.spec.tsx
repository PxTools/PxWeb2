import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { renderWithProviders } from '../../../util/testing-utils';
import { NotFound } from './NotFound';

// Mock the external dependencies
vi.mock('react-router', () => ({
  useLocation: () => ({
    pathname: '/test-path',
  }),
}));

// Mock the internal components
vi.mock('../ErrorLayout', () => ({
  ErrorLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-layout">{children}</div>
  ),
}));
vi.mock('../../ErrorMessage/ErrorMessage', () => ({
  ErrorMessage: () => <div data-testid="error-message">ErrorMessage</div>,
}));
vi.mock('@pxweb2/pxweb2-ui', () => ({
  Breadcrumbs: ({
    breadcrumbItems,
    variant,
  }: {
    breadcrumbItems: Array<{ label: string; href: string }>;
    variant: string;
  }) => (
    <div
      data-testid="breadcrumbs"
      data-variant={variant}
      data-items-count={breadcrumbItems?.length}
    >
      {breadcrumbItems?.map((item, index) => (
        <span key={index} data-testid={`breadcrumb-item-${index}`}>
          {item.label}
        </span>
      ))}
    </div>
  ),
  BreakpointsXsmallMaxWidth: '575px',
  BreakpointsMediumMaxWidth: '767px',
  BreakpointsLargeMaxWidth: '991px',
  BreakpointsXlargeMaxWidth: '1199px',
}));

describe('NotFound', () => {
  it('should render successfully', () => {
    const { container } = renderWithProviders(<NotFound />);

    expect(container.firstChild).toBeTruthy();
  });

  it('should render the error layout', () => {
    const { getByTestId } = renderWithProviders(<NotFound />);

    expect(getByTestId('error-layout')).toBeInTheDocument();
  });

  describe('Breadcrumbs', () => {
    it('should render the breadcrumbs component', () => {
      const { getByTestId } = renderWithProviders(<NotFound />);
      const breadcrumbs = getByTestId('breadcrumbs');

      expect(breadcrumbs).toBeInTheDocument();
    });

    it('should render breadcrumbs with correct items', () => {
      const { getByTestId } = renderWithProviders(<NotFound />);
      const breadcrumbs = getByTestId('breadcrumbs');

      expect(breadcrumbs).toHaveAttribute('data-items-count', '2');
      expect(getByTestId('breadcrumb-item-0')).toBeInTheDocument(); // Should have root/home breadcrumb
      expect(getByTestId('breadcrumb-item-1')).toBeInTheDocument(); // Should have current page breadcrumb
    });

    it('should use correct breadcrumbs variant based on screen size', () => {
      const { getByTestId } = renderWithProviders(<NotFound />);
      const breadcrumbs = getByTestId('breadcrumbs');

      expect(breadcrumbs).toHaveAttribute('data-variant');
    });
  });

  it('should render the error message', () => {
    const { getByTestId } = renderWithProviders(<NotFound />);

    expect(getByTestId('error-message')).toBeInTheDocument();
  });
});
