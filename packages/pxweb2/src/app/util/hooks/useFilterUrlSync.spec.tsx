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
    timeUnit: 'Monthly'
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
    timeUnit: 'Monthly'
  },
] as Table[];

const baseState = (): StartPageState => ({
  availableTables: tableExamles,
  filteredTables: tableExamles,
  availableFilters: {
    subjectTree: [],
    timeUnits: new Map<string, number>(),
    yearRange: { min: 0, max: 9999 },
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

  
});
