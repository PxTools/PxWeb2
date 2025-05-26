import { type Table, TableService, OpenAPI } from '@pxweb2/pxweb2-api-client';
import { getConfig } from './config/getConfig';
import type { Filter } from '../pages/StartPage/StartPageTypes';
import { extractYear } from './startPageFilters';

export const getFullTable: Promise<Table[]> = new Promise((resolve, reject) => {
  const config = getConfig();
  const baseUrl = config.apiUrl;
  OpenAPI.BASE = baseUrl;

  let table = localStorage.getItem('table');
  if (table) {
    resolve(JSON.parse(table) as Table[]);
  } else {
    TableService.listAllTables(
      config.language.defaultLanguage,
      undefined,
      undefined,
      true,
      1,
      10000,
    )
      .then((response) => {
        //localStorage.setItem('table', JSON.stringify(response.tables));
        resolve(response.tables);
      })
      .catch((error: Error) => {
        console.error('Failed to fetch tables:', error);
        reject(error);
      });
  }
});

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

  const yearRangeFilter = filters.find((f) => f.type === 'yearRange');
  const testYearRangeFilter = () => {
    if (!yearRangeFilter) {
      return true;
    }
    const [minStr, maxStr] = yearRangeFilter.value.split('-');
    const min = parseInt(minStr, 10);
    const max = parseInt(maxStr, 10);
    const firstYear = extractYear(table.firstPeriod);
    const lastYear = extractYear(table.lastPeriod);

    if (!Number.isFinite(firstYear) || !Number.isFinite(lastYear)) {
      return false;
    }
    const isInRange =
      (firstYear >= min && firstYear <= max) ||
      (lastYear >= min && lastYear <= max) ||
      (firstYear <= min && lastYear >= max);

    return isInRange;
  };
  return testTimeUnitFilters() && testSubjectFilters() && testYearRangeFilter();
}
