import { type Table, TableService, OpenAPI } from '@pxweb2/pxweb2-api-client';
import { getConfig } from './config/getConfig';
import type { Filter } from '../pages/StartPage/StartPageTypes';

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
      3000,
    )
      .then((response) => {
        localStorage.setItem('table', JSON.stringify(response.tables));
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
  return testTimeUnitFilters() && testSubjectFilters();
}
