import { type Table, TableService, OpenAPI } from '@pxweb2/pxweb2-api-client';
import { getConfig } from './config/getConfig';
import type { Filter } from '../pages/StartPage/StartPageTypes';

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

  const variableFilters = filters.filter((f) => {
    return f.type === 'variable';
  });
  const testVariableFilters = function () {
    if (variableFilters.length == 0) {
      return true;
    } else {
      return variableFilters.some((filter) => {
        return table.variableNames.some((varName) => {
          return varName === filter.value; // TODO fix this it doesnt work boo
        });
      });
    }
  };
  return testTimeUnitFilters() && testSubjectFilters() && testVariableFilters();
}
