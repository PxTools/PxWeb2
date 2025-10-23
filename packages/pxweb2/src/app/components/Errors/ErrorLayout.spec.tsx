import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ErrorLayout } from './ErrorLayout';
import classes from './ErrorLayout.module.scss';

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

  it('should render the children content', () => {
    const { getByText } = render(
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

  describe('alignment', () => {
    it('should center align content by default', () => {
      const { container } = render(
        <ErrorLayout>
          <div>Error Content</div>
        </ErrorLayout>,
      );

      const containerElement = container.querySelector(
        `.${classes.contentWrapper}`,
      );
      const mainContent = container.querySelector('main');

      expect(containerElement).toHaveClass(classes.layoutAlignCenter);
      expect(mainContent).toHaveClass(classes.alignCenter);
    });

    it('should start align content when align prop is set to start', () => {
      const { container } = render(
        <ErrorLayout align="start">
          <div>Error Content</div>
        </ErrorLayout>,
      );

      const containerElement = container.querySelector(
        `.${classes.contentWrapper}`,
      );
      const mainContent = container.querySelector('main');

      expect(containerElement).toHaveClass(classes.layoutAlignStart);
      expect(mainContent).toHaveClass(classes.alignStart);
    });
  });
});
