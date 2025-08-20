import { useEffect, useRef } from 'react';
import type { TFunction } from 'i18next';
import { ActionType } from '../../pages/StartPage/StartPageTypes';
import type {
  StartPageState,
  Filter,
  PathItem,
} from '../../pages/StartPage/StartPageTypes';

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

function buildParamsFromFilters(filters: Filter[]): URLSearchParams {
  const params = new URLSearchParams();
  const timeUnits: string[] = [];
  const subjects: string[] = [];
  let fromYear: number | undefined;
  let toYear: number | undefined;
  let q: string | undefined;

  for (const f of filters) {
    if (f.type === 'search') {
      q = String(f.value ?? '');
    }
    if (f.type === 'timeUnit') {
      timeUnits.push(String(f.value));
    }
    if (f.type === 'subject' && f.uniqueId) {
      subjects.push(String(f.uniqueId));
    }
    if (f.type === 'yearRange') {
      const [minS, maxS] = String(f.value ?? '').split('-');
      const min = parseInt(minS, 10);
      const max = parseInt(maxS, 10);
      if (Number.isFinite(min)) {
        fromYear = min;
      }
      if (Number.isFinite(max)) {
        toYear = max;
      }
    }
  }

  if (q) {
    params.set('q', q);
  }
  if (timeUnits.length) {
    params.set(
      'timeUnit',
      [...new Set(timeUnits)].sort((a, b) => a.localeCompare(b)).join(','),
    );
  }
  if (subjects.length) {
    params.set(
      'subject',
      [...new Set(subjects)].sort((a, b) => a.localeCompare(b)).join(','),
    );
  }
  if (fromYear != null) {
    params.set('from', String(fromYear));
  }
  if (toYear != null) {
    params.set('to', String(toYear));
  }

  return params;
}

function parseParamsToFilters(
  params: URLSearchParams,
  subjectTree: PathItem[],
  t: TFunction,
  availableTimeUnits?: string[],
): Filter[] {
  const filters: Filter[] = [];

  const q = params.get('q');
  if (q && q.trim() !== '') {
    filters.push({ type: 'search', value: q, label: q, index: 1 });
  }

  const tus = params.get('timeUnit');
  if (tus) {
    tus
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((raw, i) => {
        const normalized =
          availableTimeUnits?.find(
            (u) => u.toLowerCase() === raw.toLowerCase(),
          ) ?? raw;
        const translationKey = `start_page.filter.frequency.${normalized.toLowerCase()}`;
        const label = t(translationKey, { defaultValue: normalized });
        filters.push({ type: 'timeUnit', value: normalized, label, index: i });
      });
  }

  const subs = params.get('subject');
  if (subs) {
    subs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((v, i) => {
        const node = findByUniqueIdOrId(subjectTree, v);
        if (node) {
          filters.push({
            type: 'subject',
            value: node.id,
            label: node.label,
            uniqueId: node.uniqueId,
            index: i,
          });
        }
      });
  }

  const from = params.get('from');
  const to = params.get('to');
  if (from || to) {
    const f = from ? parseInt(from, 10) : undefined;
    const tY = to ? parseInt(to, 10) : undefined;
    const value = `${f ?? ''}-${tY ?? ''}`;
    const label = f && tY ? `${f} - ${tY}` : f ? `From ${f}` : `To ${tY}`;
    filters.push({ type: 'yearRange', value, label, index: 0 });
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
