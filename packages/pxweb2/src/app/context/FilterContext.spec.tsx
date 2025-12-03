import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { act } from 'react';

import { FilterContext, FilterProvider } from './FilterContext';
import {
  ActionType,
  StartPageState,
  PathItem,
  Filter,
  ReducerActionTypes,
} from '../pages/StartPage/StartPageTypes';
import type { Table } from '@pxweb2/pxweb2-api-client';

// Mock utilities used by the reducer to make behavior deterministic
vi.mock('../util/startPageFilters', () => {
  const timeUnits = new Map<string, number>([['year', 10]]);
  const variables = new Map<string, number>([['varA', 2]]);
  const status = new Map<'active' | 'discontinued', number>([
    ['active', 1],
    ['discontinued', 0],
  ]);
  return {
    getFilters: () => ({
      timeUnits: new Map<string, number>(),
      variables: new Map<string, number>(),
      subjectTree: [],
      yearRange: { min: 0, max: 0 },
      status: new Map<'active' | 'discontinued', number>(),
    }),
    getTimeUnits: () => timeUnits,
    getVariables: () => variables,
    updateSubjectTreeCounts: (subjects: PathItem[]) => subjects,
    flattenSubjectTreeToList: (subjects: PathItem[]) =>
      subjects.map((s) => s.id),
    getYearRanges: () => ({ min: 2000, max: 2020 }),
    recomputeAvailableFilters: (
      _type: unknown,
      _filters: Filter[],
      _tables: Table[],
      subjects: PathItem[],
    ) => ({
      subjectTree: subjects,
      timeUnits,
      yearRange: { min: 2000, max: 2020 },
      status,
    }),
    getStatus: () => status,
  };
});

vi.mock('../util/tableHandler', () => ({
  shouldTableBeIncluded: () => true,
}));

vi.mock('../util/utils', () => ({
  wrapWithLocalizedQuotemarks: (text: string) => `"${text}"`,
}));

// Minimal consumer to read and dispatch against the context
function Consumer({
  onRender,
}: {
  onRender: (ctx: {
    state: StartPageState;
    dispatch: (action: unknown) => void;
  }) => void;
}) {
  return (
    <FilterContext.Consumer>
      {(value) => {
        onRender({
          state: value.state,
          dispatch: (action: unknown) =>
            value.dispatch(action as ReducerActionTypes),
        });
        return (
          <div data-testid="filters-length">
            {value.state.activeFilters.length}
          </div>
        );
      }}
    </FilterContext.Consumer>
  );
}

// Helpers
const makeTables = (n: number): Table[] =>
  Array.from({ length: n }).map(
    (_, i) => ({ id: `T${i + 1}` }) as unknown as Table,
  );

const makeSubjects = (): PathItem[] => [
  { id: 's1', label: 'Subject 1', count: 0 },
  { id: 's2', label: 'Subject 2', count: 0 },
];

describe('FilterContext', () => {
  let captured: {
    state: StartPageState;
    dispatch: (action: unknown) => void;
  } | null = null;

  beforeEach(() => {
    captured = null;
  });

  it('provides initial state', () => {
    render(
      <FilterProvider>
        <Consumer onRender={(ctx) => (captured = ctx)} />
      </FilterProvider>,
    );

    expect(captured).toBeTruthy();
    const state = captured!.state;
    expect(state.availableTables).toEqual([]);
    expect(state.filteredTables).toEqual([]);
    expect(state.activeFilters).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('');
    expect(state.lastUsedYearRange).toBeNull();
  });

  it('RESET_FILTERS sets tables, subjects and available filters', () => {
    render(
      <FilterProvider>
        <Consumer onRender={(ctx) => (captured = ctx)} />
      </FilterProvider>,
    );

    const tables = makeTables(3);
    const subjects = makeSubjects();

    act(() => {
      captured!.dispatch({
        type: ActionType.RESET_FILTERS,
        payload: { tables, subjects },
      } as ReducerActionTypes);
    });

    const state = captured!.state;
    expect(state.availableTables).toHaveLength(3);
    expect(state.filteredTables).toHaveLength(3);
    expect(state.originalSubjectTree).toEqual(subjects);
    expect(state.subjectOrderList).toEqual(['s1', 's2']);
    expect(state.availableFilters.timeUnits.get('year')).toBe(10);
    expect(state.availableFilters.variables.get('varA')).toBe(2);
    expect(state.availableFilters.yearRange).toEqual({ min: 2000, max: 2020 });
    expect(state.availableFilters.status.get('active')).toBe(1);
    expect(state.lastUsedYearRange).toEqual({ min: 2000, max: 2020 });
  });

  it('ADD_FILTER appends filters and recomputes available filters', () => {
    render(
      <FilterProvider>
        <Consumer onRender={(ctx) => (captured = ctx)} />
      </FilterProvider>,
    );

    // Seed with data
    act(() => {
      captured!.dispatch({
        type: ActionType.RESET_FILTERS,
        payload: { tables: makeTables(2), subjects: makeSubjects() },
      } as ReducerActionTypes);
    });

    act(() => {
      captured!.dispatch({
        type: ActionType.ADD_FILTER,
        payload: [
          { type: 'subject', value: 's1', label: 'Subject 1', index: 1 },
        ],
      } as ReducerActionTypes);
    });

    const state = captured!.state;
    expect(state.activeFilters).toHaveLength(1);
    expect(state.filteredTables).toHaveLength(2); // shouldTableBeIncluded mocked to true
    expect(state.availableFilters.subjectTree.map((s) => s.id)).toEqual([
      's1',
      's2',
    ]);
    expect(state.availableFilters.variables.get('varA')).toBe(2);
  });

  it('ADD_SEARCH_FILTER maintains a single search filter and updates tables', () => {
    render(
      <FilterProvider>
        <Consumer onRender={(ctx) => (captured = ctx)} />
      </FilterProvider>,
    );

    act(() => {
      captured!.dispatch({
        type: ActionType.RESET_FILTERS,
        payload: { tables: makeTables(2), subjects: makeSubjects() },
      } as ReducerActionTypes);
    });

    act(() => {
      captured!.dispatch({
        type: ActionType.ADD_SEARCH_FILTER,
        payload: { text: 'economy', language: 'en' },
      } as ReducerActionTypes);
    });

    let state = captured!.state;
    expect(state.activeFilters.filter((f) => f.type === 'search')).toHaveLength(
      1,
    );
    expect(state.filteredTables).toHaveLength(2);

    // Update search text should replace, not add another
    act(() => {
      captured!.dispatch({
        type: ActionType.ADD_SEARCH_FILTER,
        payload: { text: 'population', language: 'en' },
      } as ReducerActionTypes);
    });

    state = captured!.state;
    const searches = state.activeFilters.filter((f) => f.type === 'search');
    expect(searches).toHaveLength(1);
    expect(searches[0].value).toBe('population');

    // Clearing search removes the filter
    act(() => {
      captured!.dispatch({
        type: ActionType.ADD_SEARCH_FILTER,
        payload: { text: '', language: 'en' },
      } as ReducerActionTypes);
    });

    state = captured!.state;
    expect(state.activeFilters.filter((f) => f.type === 'search')).toHaveLength(
      0,
    );
  });

  it('ADD_QUERY_FILTER maintains a single query filter, narrows available tables and sets cache', () => {
    render(
      <FilterProvider>
        <Consumer onRender={(ctx) => (captured = ctx)} />
      </FilterProvider>,
    );

    const tables = makeTables(3);
    act(() => {
      captured!.dispatch({
        type: ActionType.RESET_FILTERS,
        payload: { tables, subjects: makeSubjects() },
      } as ReducerActionTypes);
    });

    act(() => {
      captured!.dispatch({
        type: ActionType.ADD_QUERY_FILTER,
        payload: { query: 'Q1', tableIds: ['T1', 'T2'] },
      } as ReducerActionTypes);
    });

    let state = captured!.state;
    expect(state.activeFilters.filter((f) => f.type === 'query')).toHaveLength(
      1,
    );
    expect(state.availableTablesWhenQueryApplied.map((t) => t.id)).toEqual([
      'T1',
      'T2',
    ]);
    expect(state.filteredTables).toHaveLength(2);

    // Clearing query should reset availableTablesWhenQueryApplied and recompute from all tables
    act(() => {
      captured!.dispatch({
        type: ActionType.ADD_QUERY_FILTER,
        payload: { query: '', tableIds: [] },
      } as ReducerActionTypes);
    });

    state = captured!.state;
    expect(state.availableTablesWhenQueryApplied).toHaveLength(0);
    expect(state.filteredTables).toHaveLength(3);
  });

  it('REMOVE_FILTER removes by value or uniqueId and recomputes state', () => {
    render(
      <FilterProvider>
        <Consumer onRender={(ctx) => (captured = ctx)} />
      </FilterProvider>,
    );

    act(() => {
      captured!.dispatch({
        type: ActionType.RESET_FILTERS,
        payload: { tables: makeTables(2), subjects: makeSubjects() },
      } as ReducerActionTypes);
    });

    // Add two filters
    act(() => {
      captured!.dispatch({
        type: ActionType.ADD_FILTER,
        payload: [
          {
            type: 'subject',
            value: 's1',
            label: 'Subject 1',
            index: 1,
            uniqueId: 'u1',
          },
          {
            type: 'yearRange',
            value: '2000-2020',
            label: '2000-2020',
            index: 1,
          },
        ],
      } as ReducerActionTypes);
    });

    let state = captured!.state;
    expect(state.activeFilters).toHaveLength(2);

    // Remove subject by uniqueId
    act(() => {
      captured!.dispatch({
        type: ActionType.REMOVE_FILTER,
        payload: { type: 'subject', value: 's1', uniqueId: 'u1' },
      } as ReducerActionTypes);
    });

    state = captured!.state;
    expect(state.activeFilters.some((f) => f.uniqueId === 'u1')).toBe(false);
    expect(state.activeFilters).toHaveLength(1);

    // Remove last filter should reset to all tables
    act(() => {
      captured!.dispatch({
        type: ActionType.REMOVE_FILTER,
        payload: { type: 'yearRange', value: '2000-2020' },
      } as ReducerActionTypes);
    });

    state = captured!.state;
    expect(state.activeFilters).toHaveLength(0);
    expect(state.filteredTables).toHaveLength(2);
    expect(state.lastUsedYearRange).toEqual({ min: 2000, max: 2020 });
  });

  it('SET_ERROR and SET_LOADING update state flags', () => {
    render(
      <FilterProvider>
        <Consumer onRender={(ctx) => (captured = ctx)} />
      </FilterProvider>,
    );

    act(() => {
      captured!.dispatch({
        type: ActionType.SET_LOADING,
        payload: true,
      } as ReducerActionTypes);
      captured!.dispatch({
        type: ActionType.SET_ERROR,
        payload: 'Boom',
      } as ReducerActionTypes);
    });

    const state = captured!.state;
    expect(state.loading).toBe(true);
    expect(state.error).toBe('Boom');
  });
});
