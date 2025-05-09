import { Table } from '@pxweb2/pxweb2-api-client';
import { StartPageFilters } from '../pages/StartPage/StartPageTypes';

export interface PathItem {
  id: string;
  label: string;
  children?: PathItem[];
}

export function getSubjectTree(tables: Table[]): PathItem[] {
  const allPaths: PathItem[][] = getAllPath(tables);
  return organizePaths(allPaths);
}

export function organizePaths(paths: PathItem[][]): PathItem[] {
  const subjects: PathItem[] = [];

  paths.forEach((path) => {
    let currentLevel = subjects;

    path.forEach((item) => {
      let existingItem = currentLevel.find((x) => x.id === item.id);

      if (existingItem) {
        currentLevel = existingItem.children || [];
      } else {
        const newItem: PathItem = {
          id: item.id,
          label: item.label,
          children: [],
        };
        currentLevel.push(newItem);
        currentLevel = newItem.children!;
      }
    });
  });

  return subjects;
}

function getAllPath(tables: Table[]): PathItem[][] {
  const allPaths: PathItem[][] = [];
  tables.forEach((table: Table) => {
    if (table.paths) {
      allPaths.push(...table.paths);
    }
  });

  return allPaths;
}
export function getFilters(tables: Table[]): StartPageFilters {
  let filters: StartPageFilters = {
    timeUnits: new Map<string, number>(),
    subjectTree: [],
  };

  // Add timeUnit filters and calculate count
  tables.forEach((table) => {
    if (table.timeUnit) {
      filters.timeUnits.set(
        table.timeUnit,
        (filters.timeUnits.get(table.timeUnit) ?? 0) + 1,
      );
    }
  });

  // Add subjectTree filters. Consider: Calculate count??
  filters.subjectTree = getSubjectTree(tables);
  return filters;
}
