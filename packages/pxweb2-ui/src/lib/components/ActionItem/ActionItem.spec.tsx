import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { describe, it, expect, vi } from 'vitest';
import { ActionItem } from './ActionItem';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Icon component if needed
vi.mock('@pxweb2/pxweb2-ui', async () => {
  const mod = await vi.importActual<any>('@pxweb2/pxweb2-ui');
  return {
    ...mod,
    Icon: ({ iconName, className }: any) => (
      <span data-testid="icon" data-icon={iconName} className={className} />
    ),
    Spinner: () => <span data-testid="spinner" />,
    Label: ({ children, ...props }: any) => (
      <label {...props}>{children}</label>
    ),
    BodyShort: ({ children, ...props }: any) => (
      <span {...props}>{children}</span>
    ),
  };
});

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
    expect(screen.getByLabelText('Custom Aria Label')).toBeInTheDocument();
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
    expect(iconWrapper?.className).toMatch(/iconWrapper-medium/);
  });

  describe('medium size', () => {
    it('shows description', () => {
      // medium (default)
      render(
        <ActionItem iconName="BarChart" size="medium" description="desc" />,
      );
      expect(screen.getByText('desc')).toBeInTheDocument();
    });

    it('shows loading spinner when isLoading is true', () => {
      render(<ActionItem iconName="BarChart" size="medium" isLoading={true} />);

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
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
  });
});
