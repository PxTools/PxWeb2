import React from 'react';
import { render, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import type { TFunction } from 'i18next';
import useFilterUrlSync from './useFilterUrlSync';
import {
  ActionType,
  type StartPageState,
  type Filter,
} from '../../pages/StartPage/StartPageTypes';
import { Table } from '@pxweb2/pxweb2-api-client';

function Harness({
  state,
  dispatch,
  t,
}: {
  state: StartPageState;
  dispatch: React.Dispatch<any>;
  t?: TFunction;
}) {
  useFilterUrlSync(
    state,
    dispatch,
    t ?? (((key: string) => key) as unknown as TFunction),
  );
  return null;
}

const tableExamles = [
  {
    id: '1',
    label:
      'New registrations of passenger cars by region and by type of fuel. Month 2006M01-2025M07',
    description: 'NULL',
    updated: '2025-08-04T06:00:00Z',
    firstPeriod: '2006M01',
    lastPeriod: '2025M07',
    variableNames: ['region', 'fuel', 'observations', 'month'],
    source: 'Transport Analysis',
    subjectCode: 'TK',
    timeUnit: 'Monthly',
  },
  {
    id: '2',
    label:
      'New registrations of passenger cars by region and by type of fuel. Month 2006M01-2025M07',
    description: 'NULL',
    updated: '2025-08-04T06:00:00Z',
    firstPeriod: '1920M01',
    lastPeriod: '2050M07',
    variableNames: ['region', 'fuel', 'observations', 'month'],
    source: 'Transport Analysis',
    subjectCode: 'TK',
    timeUnit: 'Monthly',
  },
] as Table[];

const subjectTree = [
  {
    id: 'al',
    label: 'Arbeid',
    uniqueId: 'al',
    children: [
      {
        id: 'al03',
        label: 'Del',
        uniqueId: 'al__al03',
        children: [
          { id: 'aku', label: 'AKU', uniqueId: 'al__al03__aku', children: [] },
        ],
      },
    ],
  },
];

const baseState = (): StartPageState => ({
  availableTables: tableExamles,
  filteredTables: tableExamles,
  availableFilters: {
    subjectTree: subjectTree,
    timeUnits: new Map<string, number>(),
    yearRange: { min: 0, max: 9999 },
    variables: new Map<string, number>(),
  },
  activeFilters: [],
  loading: false,
  error: '',
  originalSubjectTree: [],
  subjectOrderList: [],
  lastUsedYearRange: null,
});

const timeUnitFilter = (value = 'Monthly'): Filter => ({
  type: 'timeUnit',
  value,
  label: value,
  index: 0,
});

function setUrl(search: string) {
  const path = '/start';
  window.history.replaceState({}, '', `${path}${search}`);
}

function currentUrl() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

beforeEach(() => {
  setUrl('');
  vi.restoreAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('useFilterUrlSync', () => {
  it('does not dispatch when URL has no params', async () => {
    setUrl('');
    const dispatch = vi.fn();
    const state = baseState();

    await act(async () => {
      render(<Harness state={state} dispatch={dispatch} />);
    });

    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: ActionType.ADD_FILTER }),
    );
  });

  it('updates the URL when activeFilters change', async () => {
    const replaceSpy = vi.spyOn(window.history, 'replaceState');
    let state = baseState();
    const dispatch = vi.fn();

    const { rerender } = render(<Harness state={state} dispatch={dispatch} />);

    state = {
      ...state,
      activeFilters: [timeUnitFilter('Monthly')],
    };

    await act(async () => {
      rerender(<Harness state={state} dispatch={dispatch} />);
    });
    expect(replaceSpy).toHaveBeenCalled();
    const lastCallArgs = replaceSpy.mock.calls.at(-1);
    expect(lastCallArgs?.[2]).toMatch(/^\S*\/start\?timeUnit=Monthly$/);
    expect(currentUrl()).toMatch(/\/start\?timeUnit=Monthly$/);
  });
  it('writes variables to URL in insertion order', async () => {
    const dispatch = vi.fn();
    const state = baseState();
    state.activeFilters = [
      { type: 'variable', value: 'age', label: 'Age', index: 0 },
      { type: 'variable', value: 'sex', label: 'Sex', index: 1 },
    ];

    await act(async () => {
      render(<Harness state={state} dispatch={dispatch} />);
    });

    expect(window.location.search).toBe(
      `?variable=${encodeURIComponent('age,sex')}`,
    );
  });
});

describe('year range in URL', () => {
  vi.mock('../startPageFilters', async (orig) => {
    const mod: any = await orig();
    return {
      ...mod,
      getYearLabels: () => ({ fromLabel: 'From', toLabel: 'To' }),
    };
  });

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('skriver full range "1990-2000" som ?from=1990&to=2000', async () => {
    const dispatch = vi.fn();
    const state = baseState();
    state.activeFilters = [
      { type: 'yearRange', value: '1990-2000', label: '1990 - 2000', index: 0 },
    ];

    await act(async () => {
      render(<Harness state={state} dispatch={dispatch} />);
    });

    expect(window.location.search).toBe('?from=1990&to=2000');
  });

  it('skriver kun "From 1749" som ?from=1749 (ingen to)', async () => {
    const dispatch = vi.fn();
    const state = baseState();
    state.activeFilters = [
      { type: 'yearRange', value: '1749', label: 'From 1749', index: 0 },
    ];

    await act(async () => {
      render(<Harness state={state} dispatch={dispatch} />);
    });

    expect(window.location.search).toBe('?from=1749');
  });

  it('skriver kun "To 2001" som ?to=2001 (overstyrer ev. from)', async () => {
    const dispatch = vi.fn();
    const state = baseState();
    state.activeFilters = [
      { type: 'timeUnit', value: 'Annual', label: 'Annual', index: 0 },
      { type: 'yearRange', value: '2001', label: 'To 2001', index: 1 },
    ];

    await act(async () => {
      render(<Harness state={state} dispatch={dispatch} />);
    });

    expect(window.location.search).toBe('?timeUnit=Annual&to=2001');
  });

  it('delvis ugyldig range "abc-2020" gir kun ?to=2020', async () => {
    const dispatch = vi.fn();
    const state = baseState();
    state.activeFilters = [
      { type: 'yearRange', value: 'abc-2020', label: 'abc - 2020', index: 0 },
    ];

    await act(async () => {
      render(<Harness state={state} dispatch={dispatch} />);
    });

    expect(window.location.search).toBe('?to=2020');
  });
});
