import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router';

import { ErrorLayout } from './ErrorLayout';

// Mock the internal components
vi.mock('../Header/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));
vi.mock('../Footer/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

describe('ErrorLayout', () => {
  const renderWithRouter = (ui: React.ReactElement) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

  it('should render successfully', () => {
    const { container } = renderWithRouter(
      <ErrorLayout>
        <div>Error Content</div>
      </ErrorLayout>,
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('should render the header', () => {
    const { getByTestId } = renderWithRouter(
      <ErrorLayout>
        <div>Error Content</div>
      </ErrorLayout>,
    );

    expect(getByTestId('header')).toBeInTheDocument();
  });

  it('should render the children content', () => {
    const { getByText } = renderWithRouter(
      <ErrorLayout>
        <div>Error Content</div>
      </ErrorLayout>,
    );

    expect(getByText('Error Content')).toBeInTheDocument();
  });

  it('should render the footer', () => {
    const { getByTestId } = render(
      <ErrorLayout>
        <div>Error Content</div>
      </ErrorLayout>,
    );

    expect(getByTestId('footer')).toBeInTheDocument();
  });

  it('should not render the header when withoutHeader is true', () => {
    const { queryByTestId } = render(
      <ErrorLayout withoutHeader={true}>
        <div>Error Content</div>
      </ErrorLayout>,
    );

    expect(queryByTestId('header')).not.toBeInTheDocument();
  });
});
