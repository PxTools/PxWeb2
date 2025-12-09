import { useEffect, useRef, useMemo } from 'react';
import type { TFunction } from 'i18next';

import { ActionType } from '../../pages/StartPage/StartPageTypes';
import type {
  StartPageState,
  Filter,
  ReducerActionTypes,
} from '../../pages/StartPage/StartPageTypes';
import { getYearLabels, getYearRangeLabelValue } from '../startPageFilters';
import {
  buildPathIndex,
  findPathByKey,
  type PathIndex,
} from '../../util/pathUtil';

type FilterQuery = {
  searchText?: string;
  query?: string;
  timeUnits: string[];
  subjects: string[];
  variables: string[];
  fromYear?: number;
  toYear?: number;
  status: string[];
};

const createEmptyFilterQuery = (): FilterQuery => ({
  timeUnits: [],
  subjects: [],
  variables: [],
  status: [],
});

function applyYearRangeToQuery(
  query: FilterQuery,
  filter: Filter,
  t: TFunction,
): void {
  const value = String(filter.value ?? '').trim();
  if (!value) {
    return;
  }

  if (value.includes('-')) {
    const [fromStr, toStr] = value.split('-', 2).map((s) => s.trim());
    const from = Number(fromStr);
    const to = Number(toStr);

    if (Number.isFinite(from)) {
      query.fromYear = from;
    }
    if (Number.isFinite(to)) {
      query.toYear = to;
    }
  }

  const year = Number(value);
  if (!Number.isFinite(year)) {
    return;
  }

  const { fromLabel, toLabel } = getYearLabels(t);
  const label = String(filter.label ?? '');
  if (label.startsWith(fromLabel)) {
    query.fromYear = year;
    delete query.toYear;
  } else if (label.startsWith(toLabel)) {
    query.toYear = year;
    delete query.fromYear;
  } else {
    query.fromYear = year;
  }
}

function appendUnique(arr: string[], value: string) {
  if (!arr.includes(value)) {
    arr.push(value);
  }
}

/**
 * Convert each active Filter object from state into entries in the query model.
 * This step ensures that filters can later be written to URL parameters.
 */
function mergeFilterIntoQuery(
  query: FilterQuery,
  f: Filter,
  t: TFunction,
): FilterQuery {
  switch (f.type) {
    case 'query':
      query.query = String(f.label ?? '');
      break;
    case 'search':
      query.searchText = String(f.value ?? '');
      break;
    case 'timeUnit':
      appendUnique(query.timeUnits, String(f.value));
      break;
    case 'subject':
      if (f.uniqueId) {
        appendUnique(query.subjects, String(f.uniqueId));
      }
      break;
    case 'yearRange': {
      applyYearRangeToQuery(query, f, t);
      break;
    }
    case 'variable':
      appendUnique(query.variables, String(f.value));
      break;
    case 'status':
      appendUnique(query.status, String(f.value));
      break;
  }
  return query;
}

/**
 * Translate the internal FilterQuery into URLSearchParams.
 * Order is preserved to match the order in which filters were added.
 */
function toSearchParams(query: FilterQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.searchText) {
    params.set('q', query.searchText);
  }

  if (query.query) {
    params.set('query', query.query);
  }

  if (query.timeUnits.length) {
    params.set('timeUnit', query.timeUnits.join(','));
  }

  if (query.subjects.length) {
    params.set('subject', query.subjects.join(','));
  }

  if (query.fromYear != null) {
    params.set('from', String(query.fromYear));
  }
  if (query.toYear != null) {
    params.set('to', String(query.toYear));
  }

  if (query.variables.length) {
    params.set('variable', query.variables.join(','));
  }

  if (query.status.length) {
    params.set('status', query.status.join(','));
  }

  return params;
}

/**
 * Builds a canonical URLSearchParams object from a list of filters.
 */
function buildParamsFromFilters(
  filters: Filter[],
  t: TFunction,
): URLSearchParams {
  const query = filters.reduce<FilterQuery>(
    (currentQuery, filter) => mergeFilterIntoQuery(currentQuery, filter, t),
    createEmptyFilterQuery(),
  );
  return toSearchParams(query);
}

/**
 * Parse URL parameters back into Filter[] so they can hydrate state on first load.
 */
function parseParamsToFilters(
  params: URLSearchParams,
  subjectIndex: PathIndex,
  t: TFunction,
  availableTimeUnits?: string[],
): Filter[] {
  const filters: Filter[] = [];

  const searchParam = params.get('q');
  if (searchParam && searchParam.trim() !== '') {
    filters.push({
      type: 'search',
      value: searchParam,
      label: searchParam,
      index: 1,
    });
  }

  const queryParam = params.get('query');
  if (queryParam && queryParam.trim() !== '') {
    filters.push({
      type: 'query',
      value: queryParam,
      label: queryParam,
      index: 1,
    });
  }

  const timeUnitParam = params.get('timeUnit');
  if (timeUnitParam) {
    timeUnitParam
      .split(',')
      .map((unit) => unit.trim())
      .filter(Boolean)
      .forEach((rawUnit, index) => {
        const normalizedUnit =
          availableTimeUnits?.find(
            (u) => u.toLowerCase() === rawUnit.toLowerCase(),
          ) ?? rawUnit;

        const translationKey = `start_page.filter.frequency.${normalizedUnit.toLowerCase()}`;
        const label = t(translationKey, { defaultValue: normalizedUnit });

        filters.push({
          type: 'timeUnit',
          value: normalizedUnit,
          label,
          index,
        });
      });
  }

  const subjectParam = params.get('subject');
  if (subjectParam) {
    let addedAnySubject = false;
    subjectParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((key, index) => {
        const node = findPathByKey(subjectIndex, key);
        if (node) {
          filters.push({
            type: 'subject',
            value: node.id,
            uniqueId: node.uniqueId,
            label: node.label,
            index,
          });
          addedAnySubject = true;
        }
        if (!addedAnySubject) {
          const url = new URL(window.location.href);
          url.searchParams.delete('subject');
          window.history.replaceState({}, '', url);
        }
      });
  }

  const fromParam = params.get('from');
  const toParam = params.get('to');

  if (fromParam || toParam) {
    const fromYear = fromParam ?? undefined;
    const toYear = toParam ?? undefined;
    const { fromLabel, toLabel } = getYearLabels(t);
    const { label, value } = getYearRangeLabelValue(
      fromYear,
      toYear,
      fromLabel,
      toLabel,
    );

    filters.push({
      type: 'yearRange',
      value,
      label,
      index: 0,
    });
  }

  const variableParam = params.get('variable');
  if (variableParam) {
    variableParam
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .forEach((v, index) => {
        const label = v.charAt(0).toUpperCase() + v.slice(1);
        filters.push({
          type: 'variable',
          value: v,
          label,
          index,
        });
      });
  }

  const statusParam = params.get('status');
  if (statusParam) {
    statusParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((rawStatus, index) => {
        const normalizedStatus =
          rawStatus.toLowerCase() === 'discontinued'
            ? 'discontinued'
            : 'active';

        const label =
          normalizedStatus === 'active'
            ? t('start_page.filter.status.updating')
            : t('start_page.filter.status.not_updating');

        filters.push({
          type: 'status',
          value: normalizedStatus,
          label,
          index,
        });
      });
  }

  return filters;
}

/**
 * Keeps URL query parameters and internal filter state in sync:
 *
 * - Reads query parameters on initial load and applies filters
 * - Updates URL when filters change
 * - Re-applies filters on browser navigation (back/forward)
 */
export default function useFilterUrlSync(
  state: StartPageState,
  dispatch: (action: ReducerActionTypes) => void,
  t: TFunction,
) {
  const hydratedRef = useRef(false);
  const lastAppliedQueryRef = useRef<string | null>(null);

  const subjectIndex = useMemo(
    () => buildPathIndex(state.availableFilters.subjectTree ?? []),
    [state.availableFilters.subjectTree],
  );

  const availableTimeUnits = useMemo(
    () => Array.from(state.availableFilters.timeUnits?.keys() ?? []),
    [state.availableFilters.timeUnits],
  );

  // Update the browser URL whenever activeFilters change.
  // Guard against overwriting incoming query parameters before hydration.
  useEffect(() => {
    const current = window.location.search.replace(/^\?/, '');
    const built = buildParamsFromFilters(state.activeFilters, t).toString();
    const hasIncoming = current.length > 0;

    if (!hydratedRef.current && hasIncoming) {
      return;
    }

    if (built !== current) {
      const url = window.location.pathname + (built ? `?${built}` : '');
      window.history.replaceState(null, '', url);
    }
  }, [state.activeFilters, t]);

  // Initialize filters from the current URL query once tables and subjectTree are available.
  // Do not re-run on every activeFilters change.
  useEffect(() => {
    const dataReady =
      state.availableTables.length > 0 &&
      state.availableFilters.subjectTree.length > 0;

    if (!dataReady) {
      return;
    }

    const current = window.location.search.replace(/^\?/, '');
    const built = buildParamsFromFilters(state.activeFilters, t).toString();

    if (!current) {
      hydratedRef.current = true;
      return;
    }
    if (current === built) {
      hydratedRef.current = true;
      return;
    }

    if (lastAppliedQueryRef.current === current) {
      return;
    }

    const params = new URLSearchParams(current);
    const filters = parseParamsToFilters(
      params,
      subjectIndex,
      t,
      availableTimeUnits,
    );

    lastAppliedQueryRef.current = current;
    dispatch({
      type: ActionType.RESET_FILTERS,
      payload: {
        tables: state.availableTables,
        subjects: state.originalSubjectTree,
      },
    });
    if (filters.length) {
      dispatch({ type: ActionType.ADD_FILTER, payload: filters });
    }

    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectIndex, t, availableTimeUnits, dispatch]);

  // Handle back/forward navigation
  // Sync filters from URL whenever the user navigates with back/forward buttons.
  useEffect(() => {
    function onPopState() {
      const paramsBefore = new URLSearchParams(window.location.search);

      const filters = parseParamsToFilters(
        paramsBefore,
        subjectIndex,
        t,
        availableTimeUnits,
      );

      dispatch({
        type: ActionType.RESET_FILTERS,
        payload: {
          tables: state.availableTables,
          subjects: state.originalSubjectTree,
        },
      });
      if (filters.length) {
        dispatch({ type: ActionType.ADD_FILTER, payload: filters });
      }

      const paramsAfter = new URLSearchParams(window.location.search);
      lastAppliedQueryRef.current = paramsAfter.toString();
      hydratedRef.current = true;
    }

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [
    dispatch,
    t,
    subjectIndex,
    availableTimeUnits,
    state.availableTables,
    state.originalSubjectTree,
  ]);
}
