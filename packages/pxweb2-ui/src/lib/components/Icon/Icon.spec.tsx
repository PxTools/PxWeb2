import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { Icon } from './Icon';
import styles from './Icon.module.scss';

describe('Icon', () => {
  it('should render an SVG element', () => {
    const { container } = render(<Icon iconName="ChevronDown" />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
  });

  it('should render the correct icon', () => {
    const { container } = render(<Icon iconName="Check" />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
  });

  it('should apply default className', () => {
    const { container } = render(<Icon iconName="Heart" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass(styles.icon);
  });

  it('should apply custom className along with default', () => {
    const { container } = render(
      <Icon iconName="Bell" className="custom-class" />,
    );
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass(styles.icon);
    expect(svg).toHaveClass('custom-class');
  });

  it('should have correct SVG attributes', () => {
    const { container } = render(<Icon iconName="Table" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('fill', 'currentColor');
  });

  it('should apply aria-label when provided', () => {
    const { container } = render(
      <Icon iconName="MagnifyingGlass" ariaLabel="Search icon" />,
    );
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-label', 'Search icon');
  });

  it('should not have aria-label when not provided', () => {
    const { container } = render(<Icon iconName="XMark" />);
    const svg = container.querySelector('svg');

    expect(svg).not.toHaveAttribute('aria-label');
  });

  it('should apply aria-hidden when true', () => {
    const { container } = render(<Icon iconName="Pencil" ariaHidden={true} />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('should not have aria-hidden when not provided', () => {
    const { container } = render(<Icon iconName="Clock" />);
    const svg = container.querySelector('svg');

    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it('should return null for non-existent icon', () => {
    const { container } = render(
      // Cast to any to bypass TypeScript checks, for testing purposes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Icon iconName={'NonExistentIcon' as any} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should handle empty className correctly', () => {
    const { container } = render(<Icon iconName="Bookmark" className="" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass(styles.icon);
    expect(svg?.getAttribute('class')).toBe(styles.icon);
  });

  it('should render filled icon variants', () => {
    const { container } = render(<Icon iconName="HeartFilled" />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
  });

  it('should render with both aria-label and aria-hidden', () => {
    const { container } = render(
      <Icon iconName="Bell" ariaLabel="Notification" ariaHidden={true} />,
    );
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-label', 'Notification');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
