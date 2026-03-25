import { type Table, TablesService, ApiError } from '@pxweb2/pxweb2-api-client';
import { getConfig } from './config/getConfig';
import type { Filter } from '../pages/StartPage/StartPageTypes';
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
const yearRangeCache = new WeakMap<Table, { start: number; end: number } | null>();

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

function getYearSpanForTable(table: Table): { start: number; end: number } | null {
  const cached = yearRangeCache.get(table);
  if (cached !== undefined) {
    return cached;
  }

  const [firstStart, firstEnd] = getYearRangeFromPeriod(table.firstPeriod ?? '');
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
  const timeUnits = new Set<string>();
  const subjectIds = new Set<string>();
  const variableNames = new Set<string>();
  let searchWords: string[] = [];
  let yearFrom: number | undefined;
  let yearTo: number | undefined;
  let statusActive = false;
  let statusDiscontinued = false;

  for (const filter of filters) {
    if (filter.type === 'timeUnit') {
      timeUnits.add(filter.value.toLowerCase());
      continue;
    }

    if (filter.type === 'subject') {
      subjectIds.add(filter.value);
      continue;
    }

    if (filter.type === 'variable') {
      variableNames.add(filter.value);
      continue;
    }

    if (filter.type === 'search') {
      searchWords = filter.value
        .toLowerCase()
        .normalize()
        .split(' ')
        .filter(Boolean);
      continue;
    }

    if (filter.type === 'yearRange') {
      const [fromStr, toStr] = filter.value.split('-');
      const parsedFrom = Number.parseInt(fromStr ?? '', 10);
      const parsedTo = toStr
        ? Number.parseInt(toStr, 10)
        : parsedFrom;

      yearFrom = Number.isNaN(parsedFrom) ? undefined : parsedFrom;
      yearTo = Number.isNaN(parsedTo) ? undefined : parsedTo;
      continue;
    }

    if (filter.type === 'status') {
      if (filter.value === 'active') {
        statusActive = true;
      }
      if (filter.value === 'discontinued') {
        statusDiscontinued = true;
      }
    }
  }

  return {
    timeUnits,
    subjectIds,
    searchWords,
    yearFrom,
    yearTo,
    variableNames,
    statusActive,
    statusDiscontinued,
  };
}

export function shouldTableBeIncludedWithMatcher(
  table: Table,
  matcher: CompiledMatcher,
): boolean {
  if (matcher.timeUnits.size > 0) {
    const tableTimeUnit = table.timeUnit?.toLowerCase() ?? '';
    if (!matcher.timeUnits.has(tableTimeUnit)) {
      return false;
    }
  }

  if (matcher.subjectIds.size > 0) {
    const tableSubjects = getSubjectIdsForTable(table);
    let hasMatchingSubject = false;
    for (const subjectId of matcher.subjectIds) {
      if (tableSubjects.has(subjectId)) {
        hasMatchingSubject = true;
        break;
      }
    }
    if (!hasMatchingSubject) {
      return false;
    }
  }

  if (matcher.searchWords.length > 0) {
    const text = getSearchTextForTable(table);
    for (const word of matcher.searchWords) {
      if (!text.includes(word)) {
        return false;
      }
    }
  }

  if (matcher.yearFrom !== undefined || matcher.yearTo !== undefined) {
    const span = getYearSpanForTable(table);
    if (!span) {
      return false;
    }

    const { yearFrom, yearTo } = matcher;
    if (yearFrom !== undefined && yearTo !== undefined) {
      if (!(span.start <= yearFrom && span.end >= yearTo)) {
        return false;
      }
    } else if (yearFrom !== undefined) {
      if (!(yearFrom >= span.start && yearFrom <= span.end)) {
        return false;
      }
    } else if (yearTo !== undefined) {
      if (!(yearTo >= span.start && yearTo <= span.end)) {
        return false;
      }
    }
  }

  if (matcher.variableNames.size > 0) {
    for (const variable of matcher.variableNames) {
      if (!table.variableNames.includes(variable)) {
        return false;
      }
    }
  }

  if (matcher.statusActive || matcher.statusDiscontinued) {
    const isDiscontinued = table.discontinued === true;
    if (matcher.statusActive && matcher.statusDiscontinued) {
      // Both selected means all statuses are accepted.
    } else if (matcher.statusActive && isDiscontinued) {
      return false;
    } else if (matcher.statusDiscontinued && !isDiscontinued) {
      return false;
    }
  }

  return true;
}

export function shouldTableBeIncluded(table: Table, filters: Filter[]) {
  const matcher = buildCompiledMatcher(filters);
  return shouldTableBeIncludedWithMatcher(table, matcher);
}
