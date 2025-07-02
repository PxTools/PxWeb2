import { type Table, TableService, OpenAPI } from '@pxweb2/pxweb2-api-client';
import { getConfig } from './config/getConfig';
import type { Filter } from '../pages/StartPage/StartPageTypes';
import { getYearRangeFromPeriod } from './startPageFilters';

export async function getAllTables() {
  const config = getConfig();
  const baseUrl = config.apiUrl;
  OpenAPI.BASE = baseUrl;

  try {
    const response = await TableService.listAllTables(
      config.language.defaultLanguage,
      undefined,
      undefined,
      true,
      1,
      10000,
    );

    return response.tables;
  } catch (error) {
    console.error('Failed to fetch tables:', error);
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

    const overlaps = (rangeStart: number, rangeEnd: number) =>
      rangeStart <= to && rangeEnd >= from;

    return overlaps(tableStart, tableEnd);
  };

  return testTimeUnitFilters() && testSubjectFilters() && testYearRangeFilter();
}
