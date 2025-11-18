import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ActionItemIcon } from './ActionItemIcon';
import styles from './ActionItemIcon.module.scss';

describe('ActionItemIcon', () => {
  it('should render an SVG element', () => {
    const { container } = render(<ActionItemIcon largeIconName="Table" />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
  });

  it('should render the correct icon', () => {
    const { container } = render(<ActionItemIcon largeIconName="BarChart" />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
  });

  it('should apply default className', () => {
    const { container } = render(
      <ActionItemIcon largeIconName="HorizontalBarChart" />,
    );
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass(styles.actionItemIcon);
  });

  it('should apply custom className along with default', () => {
    const { container } = render(
      <ActionItemIcon largeIconName="PieChart" className="custom-class" />,
    );
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass(styles.actionItemIcon);
    expect(svg).toHaveClass('custom-class');
  });

  it('should have correct SVG attributes', () => {
    const { container } = render(<ActionItemIcon largeIconName="Table" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 44 44');
    expect(svg).toHaveAttribute('fill', 'currentColor');
  });

  it('should apply aria-label when provided and not aria-hidden', () => {
    const { container } = render(
      <ActionItemIcon
        largeIconName="PopulationPyramid"
        ariaLabel="Population Pyramid icon"
      />,
    );
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-label', 'Population Pyramid icon');
    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it('should not have aria-label when not provided', () => {
    const { container } = render(<ActionItemIcon largeIconName="LineChart" />);
    const svg = container.querySelector('svg');

    expect(svg).not.toHaveAttribute('aria-label');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('should apply aria-hidden as default', () => {
    const { container } = render(<ActionItemIcon largeIconName="LineChart" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('should return null for non-existent icon', () => {
    const { container } = render(
      // Cast to any to bypass TypeScript checks, for testing purposes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <ActionItemIcon largeIconName={'NonExistentIcon' as any} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should handle empty className correctly', () => {
    const { container } = render(
      <ActionItemIcon largeIconName="LineChart" className="" />,
    );
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass(styles.actionItemIcon);
    expect(svg?.getAttribute('class')).toBe(styles.actionItemIcon);
  });
});
