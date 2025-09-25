import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ErrorLayout } from './ErrorLayout';

// Mock the internal components
vi.mock('../Header/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));
vi.mock('../Footer/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

describe('ErrorLayout', () => {
  it('should render successfully', () => {
    const { container } = render(
      <ErrorLayout>
        <div>Error Content</div>
      </ErrorLayout>,
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('should render the header', () => {
    const { getByTestId } = render(
      <ErrorLayout>
        <div>Error Content</div>
      </ErrorLayout>,
    );

    expect(getByTestId('header')).toBeInTheDocument();
  });

  it('should render the footer', () => {
    const { getByTestId } = render(
      <ErrorLayout>
        <div>Error Content</div>
      </ErrorLayout>,
    );

    expect(getByTestId('footer')).toBeInTheDocument();
  });

  it('should render the children content', () => {
    const { getByText } = render(
      <ErrorLayout>
        <div>Error Content</div>
      </ErrorLayout>,
    );

    expect(getByText('Error Content')).toBeInTheDocument();
  });

  it('should not render the header for start page generic error', () => {
    const { queryByTestId } = render(
      <ErrorLayout isStartPageGenericError={true}>
        <div>Error Content</div>
      </ErrorLayout>,
    );

    expect(queryByTestId('header')).not.toBeInTheDocument();
  });
});
