import { type Table, TablesService, ApiError } from '@pxweb2/pxweb2-api-client';
import { getConfig } from './config/getConfig';
import type { Filter, FilterType } from '../pages/StartPage/StartPageTypes';
import { getYearRangeFromPeriod } from './startPageFilters';

type CompiledMatcher = {
  timeUnits: Set<string>;
  subjectIds: Set<string>;
  searchWords: string[];
  yearFrom?: number;
  yearTo?: number;
  variableNames: Set<string>;
  statusActive: boolean;
  statusDiscontinued: boolean;
};

const subjectIdCache = new WeakMap<Table, Set<string>>();
const searchTextCache = new WeakMap<Table, string>();
const yearRangeCache = new WeakMap<
  Table,
  { start: number; end: number } | null
>();

export async function getAllTables(language?: string) {
  const config = getConfig();

  try {
    const response = await TablesService.listAllTables(
      language || config.language.defaultLanguage,
      undefined,
      undefined,
      true,
      1,
      10000,
    );

    return response.tables;
  } catch (err: unknown) {
    const error = err as ApiError;

    // Antipattern: a try/catch inside a catch is not recommended, but as a fallback
    // in case the selected language is not supported, it is needed here.
    // This ensures it is only retried once before failing completely. If fallback works, user should not be inconvenienced.
    if (error?.body?.title && error?.body?.title == 'Unsupported language') {
      try {
        const response = await TablesService.listAllTables(
          config.language.fallbackLanguage,
          undefined,
          undefined,
          true,
          1,
          10000,
        );

        return response.tables;
      } catch (err: unknown) {
        const error = err as ApiError;
        throw error;
      }
    }

    if (error?.status === 404) {
      throw new Error('No tables found (404)');
    }

    console.error('Failed to fetch tables:' + JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function queryTablesByKeyword(query: string, language?: string) {
  const config = getConfig();

  try {
    const response = await TablesService.listAllTables(
      language || config.language.defaultLanguage,
      query,
      undefined,
      true,
      1,
      10000,
    );
    return response.tables;
  } catch (err: unknown) {
    const error = err as ApiError;
    throw error;
  }
}

function getSubjectIdsForTable(table: Table): Set<string> {
  const cached = subjectIdCache.get(table);
  if (cached) {
    return cached;
  }

  const ids = new Set<string>();
  for (const path of table.paths ?? []) {
    for (const segment of path ?? []) {
      if (segment?.id) {
        ids.add(segment.id);
      }
    }
  }

  subjectIdCache.set(table, ids);
  return ids;
}

function getSearchTextForTable(table: Table): string {
  const cached = searchTextCache.get(table);
  if (cached) {
    return cached;
  }

  const text = ''
    .concat(
      table.description ?? '',
      ' ',
      table.label ?? '',
      ' ',
      table.id,
      ' ',
      table.variableNames.join(' '),
    )
    .toLowerCase()
    .normalize();

  searchTextCache.set(table, text);
  return text;
}

function getYearSpanForTable(
  table: Table,
): { start: number; end: number } | null {
  const cached = yearRangeCache.get(table);
  if (cached !== undefined) {
    return cached;
  }

  const [firstStart, firstEnd] = getYearRangeFromPeriod(
    table.firstPeriod ?? '',
  );
  const [lastStart, lastEnd] = getYearRangeFromPeriod(table.lastPeriod ?? '');
  const start = Math.min(firstStart, lastStart);
  const end = Math.max(firstEnd, lastEnd);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    yearRangeCache.set(table, null);
    return null;
  }

  const span = { start, end };
  yearRangeCache.set(table, span);
  return span;
}

export function buildCompiledMatcher(filters: Filter[]): CompiledMatcher {
  const matcher: CompiledMatcher = {
    timeUnits: new Set<string>(),
    subjectIds: new Set<string>(),
    searchWords: [],
    yearFrom: undefined,
    yearTo: undefined,
    variableNames: new Set<string>(),
    statusActive: false,
    statusDiscontinued: false,
  };

  const parseSearchWords = (value: string): string[] =>
    value.toLowerCase().normalize().split(' ').filter(Boolean);

  const parseYearRange = (
    value: string,
  ): Pick<CompiledMatcher, 'yearFrom' | 'yearTo'> => {
    const [fromStr, toStr] = value.split('-');
    const parsedFrom = Number.parseInt(fromStr ?? '', 10);
    const parsedTo = toStr ? Number.parseInt(toStr, 10) : parsedFrom;

    return {
      yearFrom: Number.isNaN(parsedFrom) ? undefined : parsedFrom,
      yearTo: Number.isNaN(parsedTo) ? undefined : parsedTo,
    };
  };

  const filterHandlers: Partial<
    Record<FilterType, (filter: Filter, current: CompiledMatcher) => void>
  > = {
    timeUnit: (filter, current) => {
      current.timeUnits.add(filter.value.toLowerCase());
    },
    subject: (filter, current) => {
      current.subjectIds.add(filter.value);
    },
    variable: (filter, current) => {
      current.variableNames.add(filter.value);
    },
    search: (filter, current) => {
      current.searchWords = parseSearchWords(filter.value);
    },
    yearRange: (filter, current) => {
      const { yearFrom, yearTo } = parseYearRange(filter.value);
      current.yearFrom = yearFrom;
      current.yearTo = yearTo;
    },
    status: (filter, current) => {
      current.statusActive ||= filter.value === 'active';
      current.statusDiscontinued ||= filter.value === 'discontinued';
    },
  };

  for (const filter of filters) {
    filterHandlers[filter.type]?.(filter, matcher);
  }

  return matcher;
}

export function shouldTableBeIncludedWithMatcher(
  table: Table,
  matcher: CompiledMatcher,
): boolean {
  const matchesTimeUnit = (): boolean => {
    if (matcher.timeUnits.size === 0) {
      return true;
    }
    const tableTimeUnit = table.timeUnit?.toLowerCase() ?? '';
    return matcher.timeUnits.has(tableTimeUnit);
  };

  const matchesSubject = (): boolean => {
    if (matcher.subjectIds.size === 0) {
      return true;
    }
    const tableSubjects = getSubjectIdsForTable(table);
    for (const subjectId of matcher.subjectIds) {
      if (tableSubjects.has(subjectId)) {
        return true;
      }
    }
    return false;
  };

  const matchesSearch = (): boolean => {
    if (matcher.searchWords.length === 0) {
      return true;
    }
    const text = getSearchTextForTable(table);
    for (const word of matcher.searchWords) {
      if (!text.includes(word)) {
        return false;
      }
    }
    return true;
  };

  const matchesYearRange = (): boolean => {
    const { yearFrom, yearTo } = matcher;
    if (yearFrom === undefined && yearTo === undefined) {
      return true;
    }

    const span = getYearSpanForTable(table);
    if (!span) {
      return false;
    }

    if (yearFrom !== undefined && yearTo !== undefined) {
      return span.start <= yearFrom && span.end >= yearTo;
    }

    if (yearFrom !== undefined) {
      return yearFrom >= span.start && yearFrom <= span.end;
    }

    return yearTo !== undefined && yearTo >= span.start && yearTo <= span.end;
  };

  const matchesVariables = (): boolean => {
    if (matcher.variableNames.size === 0) {
      return true;
    }
    for (const variable of matcher.variableNames) {
      if (!table.variableNames.includes(variable)) {
        return false;
      }
    }
    return true;
  };

  const matchesStatus = (): boolean => {
    const { statusActive, statusDiscontinued } = matcher;
    if (!statusActive && !statusDiscontinued) {
      return true;
    }

    if (statusActive && statusDiscontinued) {
      return true;
    }

    const isDiscontinued = table.discontinued === true;
    if (statusActive) {
      return !isDiscontinued;
    }

    return isDiscontinued;
  };

  return (
    matchesTimeUnit() &&
    matchesSubject() &&
    matchesSearch() &&
    matchesYearRange() &&
    matchesVariables() &&
    matchesStatus()
  );
}

export function shouldTableBeIncluded(table: Table, filters: Filter[]) {
  const matcher = buildCompiledMatcher(filters);
  return shouldTableBeIncludedWithMatcher(table, matcher);
}
