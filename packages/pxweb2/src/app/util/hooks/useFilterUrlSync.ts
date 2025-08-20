import { useEffect, useRef } from 'react';
import type { TFunction } from 'i18next';
import { ActionType } from '../../pages/StartPage/StartPageTypes';
import type {
  StartPageState,
  Filter,
  PathItem,
} from '../../pages/StartPage/StartPageTypes';

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
    params.set('timeUnit', timeUnits.join(','));
  }
  if (subjects.length) {
    params.set('subject', subjects.join(','));
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
      .filter(Boolean)
      .forEach((raw, i) => {
        const incoming = raw.trim();

        // hvis vi har en “fasit”-liste, finn case-korrekt verdi som finnes i data
        const normalized =
          availableTimeUnits?.find(
            (u) => u.toLowerCase() === incoming.toLowerCase(),
          ) ?? incoming;

        const translationKey = `start_page.filter.frequency.${normalized.toLowerCase()}`;
        const label = t(translationKey, { defaultValue: normalized });
        filters.push({ type: 'timeUnit', value: normalized, label, index: i });
      });
  }

  // subject (tillat uniqueId *også* id som fallback)
  const subs = params.get('subject');
  if (subs) {
    // flate ut subjectTree for raskt oppslag
    const all: PathItem[] = [];
    const stack = [...subjectTree];
    while (stack.length) {
      const n = stack.pop()!;
      all.push(n);
      if (n.children?.length) {
        stack.push(...n.children);
      }
    }

    subs
      .split(',')
      .filter(Boolean)
      .forEach((val, i) => {
        const v = val.trim();
        let node = all.find((n) => n.uniqueId === v);
        if (!node) {
          node = all.find((n) => n.id === v);
        } // fallback til id

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

  // from/to (årsintervall)
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
  const hydratedRef = useRef(false);
  const prevTablesRef = useRef(state.availableTables);
  const prevActiveLenRef = useRef(state.activeFilters.length);

  // SPEIL -> URL (med ekstra guard)
  useEffect(() => {
    const current = window.location.search.replace(/^\?/, '');
    const built = buildParamsFromFilters(state.activeFilters).toString();
    const tablesChanged = prevTablesRef.current !== state.availableTables;
    const hasIncoming = current.length > 0;

    // Ikke blank query på vei inn eller rett etter data-reload
    if (
      (!hydratedRef.current && hasIncoming) ||
      (hasIncoming && state.activeFilters.length === 0 && tablesChanged)
    ) {
      return;
    }

    if (built !== current) {
      const url = `${window.location.pathname}${built ? `?${built}` : ''}`;
      window.history.replaceState(null, '', url);
    }
  }, [state.activeFilters, state.availableTables]);

  // HYDRER <- URL (kjør når data er klare, og når URL ≠ state)
  useEffect(() => {
    const dataReady =
      state.availableTables.length > 0 &&
      state.availableFilters.subjectTree.length > 0;
    if (!dataReady) {
      return;
    }

    const current = window.location.search.replace(/^\?/, '');
    const built = buildParamsFromFilters(state.activeFilters).toString();

    if (current && current !== built) {
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

      // Start rent, så legg på URL-filtrene
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
    } else if (!hydratedRef.current) {
      // Ingen query -> markér som hydrert slik at speil kan ta over
      hydratedRef.current = true;
    }
  }, [
    state.availableTables,
    state.availableFilters.subjectTree,
    state.originalSubjectTree,
    state.activeFilters,
    t,
    dispatch,
  ]);

  // hold refs oppdatert
  useEffect(() => {
    prevTablesRef.current = state.availableTables;
    prevActiveLenRef.current = state.activeFilters.length;
  }, [state.availableTables, state.activeFilters.length]);
}
