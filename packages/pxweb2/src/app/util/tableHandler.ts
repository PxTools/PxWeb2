import { type Table, TableService, OpenAPI } from '@pxweb2/pxweb2-api-client';
import { getConfig } from './config/getConfig';
import type { Filter } from '../pages/StartPage/StartPageTypes';
import { compress, decompress } from './compression';

const TTL: number = 1000 * 60 * 60; // One hour, in milliseconds

export const getFullTable = async (): Promise<Table[]> => {
  const config = getConfig();
  const baseUrl = config.apiUrl;
  OpenAPI.BASE = baseUrl;

  const lastUpdated = localStorage.getItem('cacheTime');
  const shouldUseCache =
    lastUpdated && isLessThanOneHourAgo(new Date().toString(), lastUpdated);

  let storedTable = localStorage.getItem('compressedTables');
  if (storedTable && shouldUseCache) {
    const data = await decompress(storedTable);
    return JSON.parse(data) as Table[];
  } else {
    try {
      const response = await TableService.listAllTables(
        config.language.defaultLanguage,
        undefined,
        undefined,
        true,
        1,
        10000,
      );
      const compressedStringTables = await compress(
        JSON.stringify(response.tables),
      );
      localStorage.setItem('compressedTables', compressedStringTables);
      localStorage.setItem('cacheTime', new Date().toString());
      return response.tables;
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      throw error;
    }
  }
};

export function isLessThanOneHourAgo(
  current: string,
  cacheAge: string,
): boolean {
  const now = new Date(current).getTime();
  const check = new Date(cacheAge).getTime();

  const timeDifference = now - check;

  if (timeDifference < TTL) {
    return true;
  } else {
    return false; // Also returns false if inputs are invalid dates
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
  return testTimeUnitFilters() && testSubjectFilters();
}
