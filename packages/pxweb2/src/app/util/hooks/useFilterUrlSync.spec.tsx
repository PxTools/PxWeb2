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
  type ReducerActionTypes,
} from '../../pages/StartPage/StartPageTypes';
import { Table } from '@pxweb2/pxweb2-api-client';

function Harness({
  state,
  dispatch,
  t,
}: {
  state: StartPageState;
  dispatch: React.Dispatch<ReducerActionTypes>;
  t?: TFunction;
}) {
  useFilterUrlSync(
    state,
    dispatch,
    t ?? (((key: string) => key) as unknown as TFunction),
  );
  return null;
}

vi.mock('../startPageFilters', async (orig) => {
  const mod = (await orig()) as Record<string, unknown>;
  return {
    ...mod,
    getYearLabels: () => ({ fromLabel: 'From', toLabel: 'To' }),
  };
});

vi.mock('../pathUtil', async (orig) => {
  const mod = (await orig()) as Record<string, unknown>;
  return {
    ...mod,
    findPathByKey: (_index: Record<string, unknown>, key: string) => {
      const map: Record<
        string,
        { id: string; uniqueId: string; label: string }
      > = {
        UF: { id: 'UF', uniqueId: 'UF', label: 'Utdanning' },
        BE: { id: 'BE', uniqueId: 'BE', label: 'Befolkning' },
      };
      return map[key] ?? null;
    },
    buildPathIndex: () => ({}),
  };
});

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

describe('mergeFilterIntoQuery', () => {
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

  it('write yearRange to url, "1990-2000" as ?from=1990&to=2000', async () => {
    const dispatch = vi.fn();
    const state = baseState();
    state.activeFilters = [
      { type: 'yearRange', value: '1990-2000', label: '1990–2000', index: 0 },
    ];

    await act(async () => {
      render(<Harness state={state} dispatch={dispatch} />);
    });

    expect(window.location.search).toBe('?from=1990&to=2000');
  });

  it('write yearRange to url, "To 2001" as ?to=2001', async () => {
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
});

describe('parseParamsToFilters', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    cleanup();
  });

  it('hydrate yearRange ?from=1990&to=2000 to yearRange-filter', async () => {
    const dispatch = vi.fn();
    const state = baseState();

    window.history.replaceState({}, '', '/?from=1990&to=2000');

    await act(async () => {
      render(<Harness state={state} dispatch={dispatch} />);
    });

    const calls = dispatch.mock.calls.map((args) => args[0]);
    const add = calls.find((c) => c?.type === ActionType.ADD_FILTER);
    expect(add).toBeTruthy();
    expect(add.payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'yearRange',
          value: '1990-2000',
          label: '1990–2000',
        }),
      ]),
    );
  });

  it('hydrate timeUnit ?timeUnit=Annual,Monthly to timeUnit filter', async () => {
    const dispatch = vi.fn();
    const state = baseState();

    state.availableFilters.timeUnits = new Map([
      ['Annual', 1],
      ['Monthly', 1],
    ]);

    window.history.replaceState({}, '', '/?timeUnit=Annual,Monthly');

    await act(async () => {
      render(<Harness state={state} dispatch={dispatch} />);
    });

    const add = dispatch.mock.calls
      .map((args) => args[0])
      .find((c) => c?.type === ActionType.ADD_FILTER);
    expect(add).toBeTruthy();

    const timeUnits = add.payload.filter((f: Filter) => f.type === 'timeUnit');
    expect(timeUnits.map((f: Filter) => f.value)).toEqual([
      'Annual',
      'Monthly',
    ]);
  });

  it('hydrate variable fra ?variable=age,sex  to variable-filter', async () => {
    const dispatch = vi.fn();
    const state = baseState();

    window.history.replaceState({}, '', '/?variable=age,sex');

    await act(async () => {
      render(<Harness state={state} dispatch={dispatch} />);
    });

    const add = dispatch.mock.calls
      .map((args) => args[0])
      .find((c) => c?.type === ActionType.ADD_FILTER);
    expect(add).toBeTruthy();
    const vars = add.payload.filter((f: Filter) => f.type === 'variable');
    expect(vars.map((f: Filter) => f.value)).toEqual(['age', 'sex']);
    expect(vars.map((f: Filter) => f.label)).toEqual(['Age', 'Sex']);
  });

  it('hydrates subjects from ?subject=UF,BE by looking them up in subjectIndex', async () => {
    const dispatch = vi.fn();
    const state = baseState();

    window.history.replaceState({}, '', '/?subject=UF,BE');

    await act(async () => {
      render(<Harness state={state} dispatch={dispatch} />);
    });

    const add = dispatch.mock.calls
      .map((args) => args[0])
      .find((c) => c?.type === ActionType.ADD_FILTER);
    expect(add).toBeTruthy();

    const subs = add.payload.filter((f: Filter) => f.type === 'subject');
    expect(subs.map((f: Filter) => f.value)).toEqual(['UF', 'BE']);
    expect(subs.map((f: Filter) => f.label)).toEqual([
      'Utdanning',
      'Befolkning',
    ]);
  });
});
