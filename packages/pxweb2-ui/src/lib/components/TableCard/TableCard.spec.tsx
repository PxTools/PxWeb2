import { render } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import TableCard from './TableCard';

describe('TableCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TableCard
        href="/"
        title="Table title"
        tableId="00000"
        period="yyyy–yyyy"
        frequency="Time interval"
        updatedLabel="Oppdatert"
        lastUpdated="dd.mm.yyyy"
      />,
    );

    expect(baseElement).toBeTruthy();
  });

  it('should display the title, table ID, period, frequency, and updated info', () => {
    const { getByText } = render(
      <TableCard
        href="/"
        title="Testtabell"
        tableId="123"
        period="2020–2024"
        frequency="Årlig"
        updatedLabel="Oppdatert"
        lastUpdated="01.01.2025"
      />,
    );

    expect(getByText('Testtabell')).toBeInTheDocument();
    expect(getByText('2020–2024')).toBeInTheDocument();
    expect(getByText('Årlig')).toBeInTheDocument();
    expect(getByText('Oppdatert 01.01.2025')).toBeInTheDocument();
    expect(getByText('123')).toBeInTheDocument();
  });

  it('should navigate to href on click', () => {
    const { getByRole } = render(
      <TableCard href="/expected-path" title="Test" />,
    );

    const link = getByRole('link');

    expect(link).toHaveAttribute('href', '/expected-path');
  });

  it('should execute href function on click', () => {
    const subLink = vi.fn();

    const { getByRole } = render(<TableCard href={subLink} title="Test" />);

    getByRole('link').click();

    expect(subLink).toHaveBeenCalled();
  });

  it.each(['Enter', ' '])('should execute callback on key "%s"', (key) => {
    const subLink = vi.fn();

    const { getByRole } = render(<TableCard href={subLink} title="Test" />);

    const card = getByRole('link');

    card.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    expect(subLink).toHaveBeenCalled();
  });

  it('should NOT navigate on click if text is selected', () => {
    const mockSelection: Partial<Selection> = {
      toString: () => 'noe tekst',
    };

    vi.spyOn(window, 'getSelection').mockReturnValue(
      mockSelection as Selection,
    );

    const { getByRole } = render(<TableCard href="/wrong" title="Test" />);

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    getByRole('link').dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
