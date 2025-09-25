import React, { ReactNode } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { FilterSidebar } from './FilterSidebar';
import { FilterContext } from '../../context/FilterContext';
import { ActionType } from '../../pages/StartPage/StartPageTypes';

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

vi.mock('@pxweb2/pxweb2-ui', () => ({
  FilterCategory: ({
    header,
    children,
  }: {
    header: ReactNode;
    children: ReactNode;
  }) => (
    <section>
      <h3>{header}</h3>
      <div>{children}</div>
    </section>
  ),
  Checkbox: ({
    id,
    text,
    value,
    onChange,
    subtle,
  }: {
    id: string;
    text: string;
    value: boolean;
    subtle?: boolean;
    onChange?: (checked: boolean) => void;
  }) => (
    <label htmlFor={id} data-subtle={subtle ? 'true' : 'false'}>
      <input
        id={id}
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange?.(e.currentTarget.checked)}
      />
      <span>{text}</span>
    </label>
  ),
  Search: () => <div data-testid="search-stub" />,
  SearchSelect: (props: any) => (
    <div
      data-testid="searchselect-stub"
      aria-label={props?.label ?? 'SearchSelect'}
    />
  ),
}));

type StatusKey = 'active' | 'discontinued';

type TestState = {
  availableTables: Array<{
    id: string;
    timeUnit?: string;
    discontinued?: boolean;
  }>;
  activeFilters: Array<{
    type: string;
    value: string;
    label?: string;
    index?: number;
    uniqueId?: string;
  }>;
  availableFilters: {
    subjectTree: [];
    timeUnits: Map<string, number>;
    variables: Map<string, number>;
    status: Map<StatusKey, number>;
  };
  filteredTables?: [];
  subjectOrderList?: [];
  error?: string | null;
  loading?: boolean;
};

const makeBaseState = (overrides: Partial<TestState> = {}): TestState => ({
  availableTables: [],
  activeFilters: [],
  availableFilters: {
    subjectTree: [],
    timeUnits: new Map<string, number>(),
    variables: new Map<string, number>(),
    status: new Map<StatusKey, number>(),
  },
  filteredTables: [],
  subjectOrderList: [],
  error: null,
  loading: false,
  ...overrides,
});

const renderWithFilterContext = (state: TestState, dispatch = vi.fn()) => {
  return {
    dispatch,
    ...render(
      <FilterContext.Provider
        value={{ state: state as any, dispatch: dispatch as any }}
      >
        <FilterSidebar onFilterChange={vi.fn()} />
      </FilterContext.Provider>,
    ),
  };
};

describe('FilterSidebar - Status filter', () => {
  it('viser IKKE "Status"-seksjonen når ingen tabeller er discontinued', () => {
    const state = makeBaseState({
      availableTables: [
        { id: 'a', discontinued: false },
        { id: 'b', discontinued: undefined },
      ],
      availableFilters: {
        subjectTree: [],
        timeUnits: new Map(),
        variables: new Map(),
        status: new Map<StatusKey, number>([
          ['active', 2],
          ['discontinued', 0],
        ]),
      },
    });

    renderWithFilterContext(state);

    expect(
      screen.queryByRole('heading', { name: 'start_page.filter.status.title' }),
    ).not.toBeInTheDocument();
  });

  it('viser "Status"-seksjonen når minst én tabell er discontinued', () => {
    const state = makeBaseState({
      availableTables: [
        { id: 'a', discontinued: false },
        { id: 'b', discontinued: true },
      ],
      availableFilters: {
        subjectTree: [],
        timeUnits: new Map(),
        variables: new Map(),
        status: new Map<StatusKey, number>([
          ['active', 5],
          ['discontinued', 1],
        ]),
      },
    });

    renderWithFilterContext(state);

    expect(
      screen.getByRole('heading', { name: 'start_page.filter.status.title' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('start_page.filter.status.updating (5)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('start_page.filter.status.not_updating (1)'),
    ).toBeInTheDocument();
  });

  /* it('kryss av "not_updating" -> dispatcher ADD_FILTER og avkrysse -> REMOVE_FILTER', () => {
    const state = makeBaseState({
      availableTables: [{ id: 'b', discontinued: true }],
      activeFilters: [],
      availableFilters: {
        subjectTree: [],
        timeUnits: new Map(),
        variables: new Map(),
        status: new Map<StatusKey, number>([
          ['active', 0],
          ['discontinued', 3],
        ]),
      },
    });
    const dispatch = vi.fn();

    renderWithFilterContext(state, dispatch);

    const discontinuedLabel = screen.getByText(
      'start_page.filter.status.not_updating (3)',
    );
    // Finn label-kontaineren og så checkboxen
    const discontinuedBox = within(
      discontinuedLabel.closest('label')!,
    ).getByRole('checkbox');

    // På
    fireEvent.click(discontinuedBox);
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionType.ADD_FILTER,
      payload: [
        {
          type: 'status',
          value: 'discontinued',
          label: 'start_page.filter.status.not_updating',
          index: 1,
        },
      ],
    });

    // Av
    fireEvent.click(discontinuedBox);
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionType.REMOVE_FILTER,
      payload: { type: 'status', value: 'discontinued' },
    });
  }); */

  it('kryss av "updating" -> dispatcher ADD_FILTER', () => {
    const state = makeBaseState({
      availableTables: [{ id: 'x', discontinued: true }],
      availableFilters: {
        subjectTree: [],
        timeUnits: new Map(),
        variables: new Map(),
        status: new Map<StatusKey, number>([
          ['active', 10],
          ['discontinued', 0],
        ]),
      },
    });
    const dispatch = vi.fn();

    renderWithFilterContext(state, dispatch);

    const activeLabel = screen.getByText(
      'start_page.filter.status.updating (10)',
    );
    const activeBox = within(activeLabel.closest('label')!).getByRole(
      'checkbox',
    );

    fireEvent.click(activeBox);

    expect(dispatch).toHaveBeenCalledWith({
      type: ActionType.ADD_FILTER,
      payload: [
        {
          type: 'status',
          value: 'active',
          label: 'start_page.filter.status.updating',
          index: 0,
        },
      ],
    });
  });
});

describe('FilterSidebar – TimeUnit filter', () => {
  it('renderer tilgjengelige timeUnits, viser count og toggler ADD/REMOVE', () => {
    // I komponenten hentes "allTimeUnits" fra availableTables og sorteres via sortTimeUnit
    // og count hentes fra state.availableFilters.timeUnits. (FilterSidebar.tsx)
    const state = makeBaseState({
      availableTables: [
        { id: 't1', timeUnit: 'Annual' },
        { id: 't2', timeUnit: 'Monthly' },
        { id: 't3', timeUnit: 'Annual' },
      ],
      activeFilters: [
        { type: 'timeUnit', value: 'Annual', label: 'Annual', index: 0 },
      ],
      availableFilters: {
        subjectTree: [],
        variables: new Map(),
        status: new Map(),
        timeUnits: new Map<string, number>([
          ['Annual', 2],
          ['Monthly', 1],
        ]),
      },
    });
    const dispatch = vi.fn();

    renderWithFilterContext(state, dispatch);

    // Header for seksjonen
    expect(
      screen.getByRole('heading', { name: 'start_page.filter.timeUnit' }),
    ).toBeInTheDocument();

    // Etiketter inkl. count (label oversettes med nøkkel "start_page.filter.frequency.<lowercase>")
    const annual = screen.getByText('start_page.filter.frequency.annual (2)');
    const monthly = screen.getByText('start_page.filter.frequency.monthly (1)');

    // Annual skal være avkrysset (vi la den inn i activeFilters)
    const annualBox = within(annual.closest('label')!).getByRole('checkbox');
    const monthlyBox = within(monthly.closest('label')!).getByRole('checkbox');

    expect(annualBox).toBeChecked();
    expect(monthlyBox).not.toBeChecked();

    // Klikk av "Annual" -> REMOVE_FILTER
    fireEvent.click(annualBox);
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionType.REMOVE_FILTER,
      payload: { value: 'Annual', type: 'timeUnit' },
    });

    // Klikk på "Monthly" -> ADD_FILTER
    fireEvent.click(monthlyBox);
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionType.ADD_FILTER,
      payload: [
        {
          type: 'timeUnit',
          value: 'Monthly',
          label: 'start_page.filter.frequency.monthly',
          index: 1,
        },
      ],
    });
  });
});
