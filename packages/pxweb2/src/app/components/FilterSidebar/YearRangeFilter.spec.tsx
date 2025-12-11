import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';

import { YearRangeFilter } from './YearRangeFilter';
import { FilterContext } from '../../context/FilterContext';
import type { StartPageState } from '../../pages/StartPage/StartPageTypes';
import { type Table } from '@pxweb2/pxweb2-api-client';

vi.mock('react-i18next', async () => {
  const actual =
    await vi.importActual<typeof import('react-i18next')>('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, opts?: { year?: string | number }) =>
        opts?.year ? `${key} ${opts.year}` : key,
    }),
  };
});

describe('YearRangeFilter', () => {
  const mockDispatch = vi.fn();

  const baseState: StartPageState = {
    activeFilters: [],
    lastUsedYearRange: { min: 2000, max: 2005 },
    originalSubjectTree: [],
    subjectOrderList: [],
    availableTables: [],
    filteredTables: [],
    availableFilters: {
      subjectTree: [],
      timeUnits: new Map(),
      variables: new Map(),
      yearRange: { min: 2000, max: 2005 },
      status: new Map(),
    },
    loading: false,
    error: '',
  };

  const sampleTables: Table[] = [
    {
      id: 'table1',
      label: 'Test Table 1',
      firstPeriod: '2000',
      lastPeriod: '2005',
      updated: null,
      variableNames: [],
      links: null,
    },
    {
      id: 'table2',
      label: 'Test Table 2',
      firstPeriod: '2001',
      lastPeriod: '2004',
      updated: null,
      variableNames: [],
      links: null,
    },
  ];

  const renderWithContext = (customState = {}) => {
    const state = {
      ...baseState,
      filteredTables: sampleTables,
      ...customState,
    };

    return render(
      <FilterContext.Provider value={{ state, dispatch: mockDispatch }}>
        <YearRangeFilter />
      </FilterContext.Provider>,
    );
  };

  it('renders two SearchSelect components', () => {
    renderWithContext();
    expect(screen.getByLabelText(/from_year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to_year/i)).toBeInTheDocument();
  });

  it('shows correct year options in from and to select', async () => {
    renderWithContext();

    const fromSelect = screen.getByLabelText(/from_year/i);
    fireEvent.focus(fromSelect);
    const fromListbox = await screen.findByRole('listbox');
    expect(within(fromListbox).getByText('2000')).toBeInTheDocument();
    expect(within(fromListbox).getByText('2005')).toBeInTheDocument();
    fireEvent.keyDown(fromSelect, { key: 'Escape' });

    const toSelect = screen.getByLabelText(/to_year/i);
    fireEvent.focus(toSelect);
    const toListbox = await screen.findByRole('listbox');
    expect(within(toListbox).getByText('2000')).toBeInTheDocument();
    expect(within(toListbox).getByText('2005')).toBeInTheDocument();
  });

  it('disables "to" options below selected "from" year', async () => {
    const filter = {
      type: 'yearRange',
      value: '2003',
      label: 'from_label 2003',
    };
    renderWithContext({ activeFilters: [filter] });

    fireEvent.focus(screen.getByLabelText(/to_year/i));
    expect(screen.queryByText('2000')).not.toBeInTheDocument();
    expect(screen.getByText('2003')).toBeInTheDocument();
    expect(screen.getByText('2005')).toBeInTheDocument();
  });
});
