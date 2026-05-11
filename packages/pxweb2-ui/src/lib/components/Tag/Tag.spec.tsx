import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { Tag } from './Tag';
import classes from './Tag.module.scss';

describe('Tag', () => {
  it('renders default classes when no props are provided', () => {
    const { container } = render(<Tag />);
    const tag = container.firstElementChild as HTMLElement;

    expect(tag).toHaveClass(classes.tag);
    expect(tag).toHaveClass(classes['variant-default']);
    expect(tag).toHaveClass(classes['color-neutral']);
    expect(tag).toHaveClass(classes['size-medium']);
    expect(tag).toHaveClass(classes['label-medium']);
  });

  it('renders children when provided', () => {
    render(<Tag>Tag text</Tag>);

    expect(screen.getByText('Tag text')).toBeInTheDocument();
  });

  it('applies selected variant, color, and size classes', () => {
    const { container } = render(
      <Tag variant="border" color="error" size="small">
        Tag
      </Tag>,
    );
    const tag = container.firstElementChild as HTMLElement;

    expect(tag).toHaveClass(classes['variant-border']);
    expect(tag).toHaveClass(classes['color-error']);
    expect(tag).toHaveClass(classes['size-small']);
    expect(tag).toHaveClass(classes['label-small']);
  });

  it('passes through HTML span attributes and merges className', () => {
    render(
      <Tag
        title="tag-title"
        aria-label="tag-aria"
        data-testid="tag-element"
        className="custom-tag"
      >
        Tag
      </Tag>,
    );

    const tag = screen.getByTestId('tag-element');
    expect(tag).toHaveAttribute('title', 'tag-title');
    expect(tag).toHaveAttribute('aria-label', 'tag-aria');
    expect(tag).toHaveClass('custom-tag');
  });

  it.each(['neutral', 'info', 'success', 'warning', 'error'] as const)(
    'applies color class for %s',
    (color) => {
      const { container } = render(<Tag color={color}>Tag</Tag>);
      const tag = container.firstElementChild as HTMLElement;

      expect(tag).toHaveClass(classes[`color-${color}`]);
    },
  );

  it.each(['default', 'border'] as const)(
    'applies variant class for %s',
    (variant) => {
      const { container } = render(<Tag variant={variant}>Tag</Tag>);
      const tag = container.firstElementChild as HTMLElement;

      expect(tag).toHaveClass(classes[`variant-${variant}`]);
    },
  );

  it.each(['medium', 'small', 'xsmall'] as const)(
    'applies size class for %s',
    (size) => {
      const { container } = render(<Tag size={size}>Tag</Tag>);
      const tag = container.firstElementChild as HTMLElement;

      expect(tag).toHaveClass(classes[`size-${size}`]);
    },
  );

  it('uses label-medium for medium and label-small for non-medium sizes', () => {
    const { container: mediumContainer } = render(<Tag size="medium">Tag</Tag>);
    const mediumTag = mediumContainer.firstElementChild as HTMLElement;
    expect(mediumTag).toHaveClass(classes['label-medium']);

    const { container: smallContainer } = render(<Tag size="small">Tag</Tag>);
    const smallTag = smallContainer.firstElementChild as HTMLElement;
    expect(smallTag).toHaveClass(classes['label-small']);
  });
});
