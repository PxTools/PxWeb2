import { Table } from '@pxweb2/pxweb2-api-client';

export interface PathItem {
  id: string;
  label: string;
  children?: PathItem[];
}

export function getSubjectTree(tables: Table[]): PathItem[] {
  const allPaths: PathItem[][] = getAllPath(tables);
  console.log('allPaths: ' + JSON.stringify(allPaths, null, 4));
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
