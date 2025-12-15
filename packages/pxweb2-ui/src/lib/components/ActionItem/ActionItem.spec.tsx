import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { ActionItem } from './ActionItem';

// Mock UI components
vi.mock('@pxweb2/pxweb2-ui', () => ({
  Icon: ({ iconName, className }: { iconName: string; className?: string }) => (
    <span data-testid="icon" data-icon={iconName} className={className} />
  ),
  ActionItemIcon: ({ largeIconName }: { largeIconName: string }) => (
    <span data-testid="action-item-icon" data-large-icon={largeIconName} />
  ),
  CheckCircleIcon: ({ checked }: { checked: boolean }) => (
    <span data-testid="check-circle-icon" data-checked={checked} />
  ),
  Spinner: () => <span data-testid="spinner" />,
  Label: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
  } & React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
  BodyShort: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props}>{children}</span>
  ),
}));

describe('ActionItem', () => {
  it('renders with default props', () => {
    render(<ActionItem iconName="BarChart" />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toHaveAttribute('data-icon', 'BarChart');
  });

  it('renders with custom label, ariaLabel and description', () => {
    render(
      <ActionItem
        iconName="PieChart"
        label="Custom Label"
        ariaLabel="Custom Aria Label"
        description="Custom description"
      />,
    );

    expect(
      screen.getByLabelText('Custom Aria Label. Custom description'),
    ).toBeInTheDocument();
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toHaveAttribute('data-icon', 'PieChart');
  });

  it('uses label when no ariaLabel is provided', () => {
    render(<ActionItem iconName="PieChart" label="Custom Label" />);

    expect(screen.getByLabelText('Custom Label')).toBeInTheDocument();
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toHaveAttribute('data-icon', 'PieChart');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ActionItem iconName="BarChart" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });

  it('applies correct class names for size', () => {
    render(<ActionItem largeIconName="BarChart" size="medium" />);
    const iconWrapper = screen.getByTestId('icon').parentElement;

    expect(iconWrapper?.className).toMatch(/icon-wrapper-medium/);
  });

  describe('medium size', () => {
    it('shows description', () => {
      // medium (default)
      render(<ActionItem iconName="BarChart" description="desc" />);

      expect(screen.getByText('desc')).toBeInTheDocument();
    });

    it('shows loading spinner when isLoading is true', () => {
      render(<ActionItem iconName="BarChart" size="medium" isLoading={true} />);

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('shows toggle state when toggleState is provided', () => {
      render(
        <ActionItem
          iconName="Table"
          size="medium"
          toggleState={true}
          label="Toggle Test"
        />,
      );

      expect(screen.getByTestId('check-circle-icon')).toHaveAttribute(
        'data-checked',
        'true',
      );
    });
  });

  describe('large size', () => {
    it('does not show description', () => {
      render(
        <ActionItem largeIconName="Table" size="large" description="desc2" />,
      );

      expect(screen.queryByText('desc2')).not.toBeInTheDocument();
    });

    it('does not show loading spinner when isLoading is true', () => {
      render(<ActionItem iconName="BarChart" size="large" isLoading={true} />);

      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    it('shows toggle state when toggleState is provided', () => {
      render(
        <ActionItem
          largeIconName="Table"
          size="large"
          toggleState={false}
          label="Toggle Test Large"
        />,
      );

      expect(screen.getByTestId('check-circle-icon')).toHaveAttribute(
        'data-checked',
        'false',
      );
    });
  });
});
