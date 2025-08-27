import { useEffect, useRef } from 'react';
import type { TFunction } from 'i18next';
import { ActionType } from '../../pages/StartPage/StartPageTypes';
import type {
  StartPageState,
  Filter,
  PathItem,
} from '../../pages/StartPage/StartPageTypes';
import { getYearLabels, getYearRangeLabelValue } from '../startPageFilters';

type FilterQuery = {
  searchText?: string;
  timeUnits: string[];
  subjects: string[];
  variables: string[];
  fromYear?: number;
  toYear?: number;
};

/**
 * Flattens a hierarchical subject tree into a flat list of all nodes.
 */
function flattenSubjectTree(tree: PathItem[]) {
  const result: PathItem[] = [];
  const stack = [...tree];
  while (stack.length) {
    const n = stack.pop()!;
    result.push(n);
    if (n.children?.length) {
      stack.push(...n.children);
    }
  }
  return result;
}

/**
 * Finds a subject node in the tree using uniqueId first, falling back to id if no uniqueId match is found.
 */
function findByUniqueIdOrId(tree: PathItem[], v: string) {
  const all = flattenSubjectTree(tree);
  return all.find((n) => n.uniqueId === v) ?? all.find((n) => n.id === v);
}

const createEmptyFilterQuery = (): FilterQuery => ({
  timeUnits: [],
  subjects: [],
  variables: [],
});

function applyYearRangeToQuery(
  query: FilterQuery,
  filter: Filter,
  t: TFunction,
): void {
  const lowerLabel = filter.label.toLowerCase();
  const fromText = t('start_page.filter.year.from_label').toLowerCase();
  const toText = t('start_page.filter.year.to_label').toLowerCase();

  if (filter.value.includes('-')) {
    const [fromStr, toStr] = filter.value.split('-').map((s) => s.trim());
    const from = Number(fromStr);
    const to = Number(toStr);
    if (Number.isFinite(from)) {
      query.fromYear = from;
    }
    if (Number.isFinite(to)) {
      query.toYear = to;
    }
  } else {
    const year = Number(filter.value.trim());
    if (!Number.isFinite(year)) {
      return;
    }

    if (lowerLabel.startsWith(fromText)) {
      query.fromYear = year;
      delete query.toYear;
    } else if (lowerLabel.startsWith(toText)) {
      query.toYear = year;
      delete query.fromYear;
    } else {
      query.fromYear = year;
    }
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
  subjectTree: PathItem[],
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
    subjectParam
      .split(',')
      .map((idOrUid) => idOrUid.trim())
      .filter(Boolean)
      .forEach((subjectKey, index) => {
        const node = findByUniqueIdOrId(subjectTree, subjectKey);
        if (node) {
          filters.push({
            type: 'subject',
            value: node.id,
            label: node.label,
            uniqueId: node.uniqueId,
            index,
          });
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
  dispatch: (a: any) => void,
  t: TFunction,
) {
  const hydratedRef = useRef(false);
  const lastAppliedQueryRef = useRef<string | null>(null);

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
  }, [state.activeFilters]);

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

    const validTimeUnits = Array.from(
      new Set(
        state.availableTables.map((t) => t.timeUnit ?? '').filter(Boolean),
      ),
    );
    const params = new URLSearchParams(current);
    const filters = parseParamsToFilters(
      params,
      state.availableFilters.subjectTree,
      t,
      validTimeUnits,
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
  }, [
    state.availableTables,
    state.availableFilters.subjectTree,
    state.originalSubjectTree,
    dispatch,
  ]);

  // Handle back/forward navigation
  // Sync filters from URL whenever the user navigates with back/forward buttons.
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const current = params.toString();

      const validTimeUnits = Array.from(
        new Set(
          state.availableTables.map((t) => t.timeUnit ?? '').filter(Boolean),
        ),
      );
      const filters = parseParamsToFilters(
        params,
        state.availableFilters.subjectTree,
        t,
        validTimeUnits,
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

      lastAppliedQueryRef.current = current;
      hydratedRef.current = true;
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [
    state.availableTables,
    state.originalSubjectTree,
    state.availableFilters.subjectTree,
    dispatch,
    t,
  ]);
}
