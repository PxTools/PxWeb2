import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';
import '@testing-library/jest-dom/vitest';

describe('Breadcrumbs', () => {
  const items = [
    new BreadcrumbItem('Home', '/'),
    new BreadcrumbItem('Library', '/library'),
    new BreadcrumbItem('Data', '/library/data'),
  ];

  beforeEach(() => {
    window.dispatchEvent(new Event('resize'));
  });

  it('renders all breadcrumb items', () => {
    render(<Breadcrumbs breadcrumbItems={items} />);
    items.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('renders with default variant', () => {
    render(<Breadcrumbs breadcrumbItems={items} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders with compact variant', () => {
    render(<Breadcrumbs breadcrumbItems={items} variant="compact" />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('shows "Show more" button and dots when overflowing in compact mode', () => {
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);

    render(<Breadcrumbs breadcrumbItems={items} variant="compact" />);
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /show more/i }),
    ).toBeInTheDocument();
  });

  it('shows all items after clicking "Show more"', () => {
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);

    render(<Breadcrumbs breadcrumbItems={items} variant="compact" />);
    fireEvent.click(screen.getByRole('button', { name: /show more/i }));
    expect(screen.queryByText('...')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /show more/i }),
    ).not.toBeInTheDocument();
    items.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('does not show "Show more" button if not overflowing', () => {
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(100);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200);

    render(<Breadcrumbs breadcrumbItems={items} variant="compact" />);
    expect(screen.queryByText('...')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /show more/i }),
    ).not.toBeInTheDocument();
  });

  it('renders links with correct hrefs', () => {
    render(<Breadcrumbs breadcrumbItems={items} />);
    items.forEach((item) => {
      const link = screen.getByText(item.label).closest('a');
      expect(link).toHaveAttribute('href', item.href);
    });
  });
});
