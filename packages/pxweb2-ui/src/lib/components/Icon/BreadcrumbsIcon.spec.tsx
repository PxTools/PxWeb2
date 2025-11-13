import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { BreadcrumbsIcon } from './BreadcrumbsIcon';

describe('Icon', () => {
  it('should render an SVG element', () => {
    const { container } = render(<BreadcrumbsIcon />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
  });

  it('should render the correct icon', () => {
    const { container } = render(<BreadcrumbsIcon />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<BreadcrumbsIcon className="custom-class" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass('custom-class');
  });

  it('should have correct SVG attributes', () => {
    const { container } = render(<BreadcrumbsIcon />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
    expect(svg).toHaveAttribute('viewBox', '0 0 20 20');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('fill', 'currentColor');
  });

  it('should apply aria-hidden', () => {
    const { container } = render(<BreadcrumbsIcon />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
