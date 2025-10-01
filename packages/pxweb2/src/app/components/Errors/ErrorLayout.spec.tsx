import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router';

import { ErrorLayout } from './ErrorLayout';

// Mock the internal components
vi.mock('../Header/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
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
});
