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

  it('renders with custom ariaLabel and description', () => {
    render(
      <ActionItem
        iconName="PieChart"
        ariaLabel="Custom Label"
        description="Custom description"
      />,
    );
    expect(screen.getByLabelText('Custom Label')).toBeInTheDocument();
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toHaveAttribute('data-icon', 'PieChart');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ActionItem iconName="BarChart" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('shows description only for medium size', () => {
    // medium (default)
    render(<ActionItem iconName="BarChart" size="medium" description="desc" />);
    expect(screen.getByText('desc')).toBeInTheDocument();

    // large
    render(
      <ActionItem largeIconName="Table" size="large" description="desc2" />,
    );
    expect(screen.queryByText('desc2')).not.toBeInTheDocument();
  });

  it('applies correct class names for size', () => {
    render(<ActionItem largeIconName="BarChart" size="medium" />);
    const iconWrapper = screen.getByTestId('icon').parentElement;
    expect(iconWrapper?.className).toMatch(/iconWrapper-medium/);
  });
});
