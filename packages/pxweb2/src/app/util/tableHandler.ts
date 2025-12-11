import {
  type Table,
  TablesService,
  OpenAPI,
  ApiError,
} from '@pxweb2/pxweb2-api-client';
import { getConfig } from './config/getConfig';
import type { Filter } from '../pages/StartPage/StartPageTypes';
import { getYearRangeFromPeriod } from './startPageFilters';

export async function getAllTables(language?: string) {
  const config = getConfig();
  const baseUrl = config.apiUrl;
  OpenAPI.BASE = baseUrl;

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
  const baseUrl = config.apiUrl;
  OpenAPI.BASE = baseUrl;

  try {
    const response = await TableService.listAllTables(
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

export function shouldTableBeIncluded(table: Table, filters: Filter[]) {
  const timeUnitFilters = filters.filter((f) => {
    return f.type === 'timeUnit';
  });

  const testTimeUnitFilters = function () {
    if (timeUnitFilters.length == 0) {
      return true;
    } else {
      return timeUnitFilters.some((filter) => {
        return table?.timeUnit?.toLowerCase() === filter.value.toLowerCase();
      });
    }
  };

  const subjectFilters = filters.filter((f) => {
    return f.type === 'subject';
  });

  const testSubjectFilters = function () {
    if (subjectFilters.length == 0) {
      return true;
    } else {
      return subjectFilters.some((filter) => {
        return table?.paths?.flat().some((path) => {
          return path.id === filter.value;
        });
      });
    }
  };

  // Note: The ActionType ADD_SEARCH has been replaced by ADD_QUERY_FILTER.
  // In the same way the FilterType 'search' has been replaced by 'query'.
  // It is kept here for possible future use. One scenario could be that the API query fails,
  // then we can fall back to client-side search filtering.
  const searchFilter = filters.find((f) => {
    return f.type === 'search';
  });

  const testSearchFilter = function () {
    if (!searchFilter) {
      return true;
    } else {
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

      return searchFilter.value
        .toLowerCase()
        .normalize()
        .split(' ')
        .every((word) => {
          return text.includes(word);
        });
    }
  };

  const testYearRangeFilter = () => {
    const yearRangeFilter = filters.find((f) => f.type === 'yearRange');
    if (!yearRangeFilter) {
      return true;
    }

    const [fromStr, toStr] = yearRangeFilter.value.split('-');
    const from = parseInt(fromStr, 10);
    const to = toStr ? parseInt(toStr, 10) : from;

    const [firstStart, firstEnd] = getYearRangeFromPeriod(
      table.firstPeriod ?? '',
    );
    const [lastStart, lastEnd] = getYearRangeFromPeriod(table.lastPeriod ?? '');
    const tableStart = Math.min(firstStart, lastStart);
    const tableEnd = Math.max(firstEnd, lastEnd);

    if (!Number.isFinite(tableStart) || !Number.isFinite(tableEnd)) {
      return false;
    }

    const hasFrom = fromStr !== undefined && fromStr !== '' && !isNaN(from);
    const hasTo = !!toStr;

    if (hasFrom && hasTo) {
      return tableStart <= from && tableEnd >= to;
    }

    if (hasFrom) {
      return from >= tableStart && from <= tableEnd;
    }

    if (hasTo) {
      return to >= tableStart && to <= tableEnd;
    }

    return true;
  };

  const variableFilters = filters.filter((f) => {
    return f.type === 'variable';
  });
  const testVariableFilters = function () {
    if (variableFilters.length == 0) {
      return true;
    } else {
      return variableFilters.every((filter) => {
        return table.variableNames.some((varName) => {
          return varName === filter.value;
        });
      });
    }
  };
  const statusFilters = filters.filter((f) => {
    return f.type === 'status';
  });
  const testStatusFilters = function () {
    if (statusFilters.length === 0) {
      return true;
    }
    return statusFilters.some((filter) => {
      if (filter.value === 'active') {
        return table.discontinued !== true;
      }
      if (filter.value === 'discontinued') {
        return table.discontinued === true;
      }
      return false;
    });
  };

  return (
    testTimeUnitFilters() &&
    testSubjectFilters() &&
    testYearRangeFilter() &&
    testSearchFilter() &&
    testVariableFilters() &&
    testStatusFilters()
  );
}
