import { ReactNode } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

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
  SearchSelect: (props: { label: string; value: string }) => (
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
  it('does NOT render the "Status" section when no tables are discontinued', () => {
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

  it('renders the "Status" section when at least one table is discontinued', () => {
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

  it('avkrysser "not_updating" når aktiv -> dispatcher REMOVE_FILTER', async () => {
    const state = makeBaseState({
      availableTables: [{ id: 'B', discontinued: true }],
      activeFilters: [
        {
          type: 'status',
          value: 'discontinued',
          label: 'start_page.filter.status.not_updating',
          index: 1,
        },
      ],
      availableFilters: {
        subjectTree: [],
        timeUnits: new Map(),
        variables: new Map(),
        status: new Map([
          ['active', 0],
          ['discontinued', 3],
        ]),
      },
    });

    const dispatch = vi.fn();
    const user = userEvent.setup();

    renderWithFilterContext(state, dispatch);

    const box = screen.getByRole('checkbox', {
      name: /start_page\.filter\.status\.not_updating(?:\s*\(\s*3\s*\))?/i,
    });

    // Ett klikk når den er aktiv -> REMOVE
    await user.click(box);

    expect(dispatch).toHaveBeenCalledWith({
      type: ActionType.REMOVE_FILTER,
      payload: { type: 'status', value: 'discontinued' },
    });
  });

  // Når "not_updating" er inaktiv -> ett klikk skal ADD_FILTER
  it('unchecks "not_updating" when active -> dispatches REMOVE_FILTER', async () => {
    const state = makeBaseState({
      availableTables: [{ id: 'B', discontinued: true }],
      activeFilters: [],
      availableFilters: {
        subjectTree: [],
        timeUnits: new Map(),
        variables: new Map(),
        status: new Map([
          ['active', 0],
          ['discontinued', 3],
        ]),
      },
    });

    const dispatch = vi.fn();
    const user = userEvent.setup();

    renderWithFilterContext(state, dispatch);

    const box = screen.getByRole('checkbox', {
      name: /start_page\.filter\.status\.not_updating(?:\s*\(\s*3\s*\))?/i,
    });

    // Ett klikk når den er inaktiv -> ADD
    await user.click(box);

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
  });

  it('checks "not_updating" when inactive -> dispatches ADD_FILTER', () => {
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

describe('FilterSidebar - TimeUnit filter', () => {
  it('renders available timeUnits, shows count and toggles ADD/REMOVE', () => {
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

    expect(
      screen.getByRole('heading', { name: 'start_page.filter.time_unit' }),
    ).toBeInTheDocument();

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
