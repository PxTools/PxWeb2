import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { Badge } from './Badge';
import classes from './Badge.module.scss';

describe('Badge', () => {
  it('renders default classes when no props are provided', () => {
    const { container } = render(<Badge />);
    const badge = container.firstElementChild as HTMLElement;

    expect(badge).toHaveClass(classes.badge);
    expect(badge).toHaveClass(classes['variant-default']);
    expect(badge).toHaveClass(classes['color-neutral']);
    expect(badge).toHaveClass(classes['size-medium']);
    expect(badge).toHaveClass(classes['no-label']);
  });

  it('renders a label when label prop is provided', () => {
    render(<Badge label="9" />);

    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('9').parentElement).not.toHaveClass(
      classes['no-label'],
    );
  });

  it('renders in no-label mode when label is an empty string', () => {
    const { container } = render(<Badge label="" />);
    const badge = container.firstElementChild as HTMLElement;

    expect(container.querySelector('span')).toBeNull();
    expect(badge).toHaveClass(classes['no-label']);
  });

  it('renders in no-label mode when label is whitespace only', () => {
    const { container } = render(<Badge label="   " />);
    const badge = container.firstElementChild as HTMLElement;

    expect(badge).toHaveClass(classes['no-label']);
  });

  it('applies classes for selected variant, color, and size', () => {
    const { container } = render(
      <Badge variant="subtle" color="error" size="large" label="11" />,
    );
    const badge = container.firstElementChild as HTMLElement;

    expect(badge).toHaveClass(classes['variant-subtle']);
    expect(badge).toHaveClass(classes['color-error']);
    expect(badge).toHaveClass(classes['size-large']);
    expect(badge).not.toHaveClass(classes['no-label']);
  });

  it.each(['neutral', 'info', 'success', 'warning', 'error'] as const)(
    'applies color class for %s',
    (color) => {
      const { container } = render(<Badge color={color} label="4" />);
      const badge = container.firstElementChild as HTMLElement;

      expect(badge).toHaveClass(classes[`color-${color}`]);
    },
  );

  it.each(['default', 'subtle'] as const)(
    'applies variant class for %s',
    (variant) => {
      const { container } = render(<Badge variant={variant} label="4" />);
      const badge = container.firstElementChild as HTMLElement;

      expect(badge).toHaveClass(classes[`variant-${variant}`]);
    },
  );

  it.each(['medium', 'large'] as const)('applies size class for %s', (size) => {
    const { container } = render(<Badge size={size} label="4" />);
    const badge = container.firstElementChild as HTMLElement;

    expect(badge).toHaveClass(classes[`size-${size}`]);
  });
});
