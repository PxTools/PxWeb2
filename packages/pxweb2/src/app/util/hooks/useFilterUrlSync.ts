import { useEffect, useRef } from 'react';
import type { TFunction } from 'i18next';
import { ActionType } from '../../pages/StartPage/StartPageTypes';
import type {
  StartPageState,
  Filter,
  PathItem,
} from '../../pages/StartPage/StartPageTypes';

type FilterQuery = {
  searchText?: string;
  timeUnits: Set<string>;
  subjects: Set<string>;
  fromYear?: number;
  toYear?: number;
};

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

function findByUniqueIdOrId(tree: PathItem[], v: string) {
  const all = flattenSubjectTree(tree);
  return all.find((n) => n.uniqueId === v) ?? all.find((n) => n.id === v);
}

const createEmptyFilterQuery = (): FilterQuery => ({
  timeUnits: new Set<string>(),
  subjects: new Set<string>(),
});

const lexicalSort = (a: string, b: string) => a.localeCompare(b);

function parseYearRange(range: unknown): {
  fromYear?: number;
  toYear?: number;
} {
  if (typeof range !== 'string') {
    return {};
  }
  const [minS, maxS] = range.split('-');
  const min = parseInt(minS, 10);
  const max = parseInt(maxS, 10);

  return {
    fromYear: Number.isFinite(min) ? min : undefined,
    toYear: Number.isFinite(max) ? max : undefined,
  };
}

function mergeFilterIntoQuery(query: FilterQuery, f: Filter): FilterQuery {
  switch (f.type) {
    case 'search':
      query.searchText = String(f.value ?? '');
      break;
    case 'timeUnit':
      query.timeUnits.add(String(f.value));
      break;
    case 'subject':
      if (f.uniqueId) {
        query.subjects.add(String(f.uniqueId));
      }
      break;
    case 'yearRange': {
      const { fromYear, toYear } = parseYearRange(f.value);
      if (fromYear != null) {
        query.fromYear = fromYear;
      }
      if (toYear != null) {
        query.toYear = toYear;
      }
      break;
    }
  }
  return query;
}

function toSearchParams(query: FilterQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.searchText) {
    params.set('q', query.searchText);
  }

  if (query.timeUnits.size) {
    params.set('timeUnit', [...query.timeUnits].sort(lexicalSort).join(','));
  }

  if (query.subjects.size) {
    params.set('subject', [...query.subjects].sort(lexicalSort).join(','));
  }

  if (query.fromYear != null) {
    params.set('from', String(query.fromYear));
  }
  if (query.toYear != null) {
    params.set('to', String(query.toYear));
  }

  return params;
}

function buildParamsFromFilters(filters: Filter[]): URLSearchParams {
  const query = filters.reduce<FilterQuery>(
    mergeFilterIntoQuery,
    createEmptyFilterQuery(),
  );
  return toSearchParams(query);
}

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
    const fromYear = fromParam ? parseInt(fromParam, 10) : undefined;
    const toYear = toParam ? parseInt(toParam, 10) : undefined;
    const value = `${fromYear ?? ''}-${toYear ?? ''}`;
    let label = '';

    if (fromYear != null && toYear != null) {
      label = `${fromYear} - ${toYear}`;
    } else if (fromYear != null) {
      label = `From ${fromYear}`;
    } else if (toYear != null) {
      label = `To ${toYear}`;
    }

    filters.push({
      type: 'yearRange',
      value,
      label,
      index: 0,
    });
  }

  return filters;
}

export default function useFilterUrlSync(
  state: StartPageState,
  dispatch: (a: any) => void,
  t: TFunction,
) {
  // Har vi allerede anvendt URL-query (den aktuelle strengen)?
  const hydratedRef = useRef(false);
  const lastAppliedQueryRef = useRef<string | null>(null);

  useEffect(() => {
    const current = window.location.search.replace(/^\?/, '');
    const built = buildParamsFromFilters(state.activeFilters).toString();
    const hasIncoming = current.length > 0;

    if (!hydratedRef.current && hasIncoming) {
      return;
    }

    if (built !== current) {
      const url = `${window.location.pathname}${built ? `?${built}` : ''}`;
      window.history.replaceState(null, '', url);
    }
  }, [state.activeFilters]);

  useEffect(() => {
    const dataReady =
      state.availableTables.length > 0 &&
      state.availableFilters.subjectTree.length > 0;

    if (!dataReady) {
      return;
    }

    const current = window.location.search.replace(/^\?/, '');
    const built = buildParamsFromFilters(state.activeFilters).toString();

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
  }, [
    state.availableTables,
    state.availableFilters.subjectTree,
    state.originalSubjectTree,
    dispatch,
  ]);

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
