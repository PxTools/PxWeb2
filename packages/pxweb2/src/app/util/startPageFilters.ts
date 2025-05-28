import { Table } from '@pxweb2/pxweb2-api-client';
import { StartPageFilters, Filter } from '../pages/StartPage/StartPageTypes';

export interface PathItem {
  id: string;
  label: string;
  children?: PathItem[];
  count?: number;
}

type TableWithPaths = Table & {
  id: string;
  paths?: { id: string; label: string }[][];
};

export function getSubjectTree(tables: Table[]): PathItem[] {
  const allPaths: PathItem[][] = getAllPath(tables);
  const organizedPaths: PathItem[] = organizePaths(allPaths);
  return updateSubjectTreeCounts(organizedPaths, tables);
}

export function organizePaths(paths: PathItem[][]): PathItem[] {
  const subjects: PathItem[] = [];

  paths.forEach((path) => {
    let currentLevel = subjects;

    path.forEach((item) => {
      let existingItem = currentLevel.find((x) => x.id === item.id);

      if (existingItem) {
        existingItem.count && existingItem.count++;
        currentLevel = existingItem.children || [];
      } else {
        const newItem: PathItem = {
          id: item.id,
          label: item.label,
          children: [],
          count: 1,
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

export function getTimeUnits(tables: Table[]): Map<string, number> {
  const timeUnits = new Map<string, number>();
  tables.forEach((table) => {
    if (table.timeUnit) {
      timeUnits.set(table.timeUnit, (timeUnits.get(table.timeUnit) ?? 0) + 1);
    }
  });
  return timeUnits;
}

export function getFilters(tables: Table[]): StartPageFilters {
  let filters: StartPageFilters = {
    timeUnits: new Map<string, number>(),
    subjectTree: [],
  };

  filters.timeUnits = getTimeUnits(tables);
  filters.subjectTree = getSubjectTree(tables);

  return filters;
}

export function updateSubjectTreeCounts(
  originalTree: PathItem[],
  filteredTables: Table[],
): PathItem[] {
  const subjectToTableMap = new Map<string, Set<string>>();

  (filteredTables as TableWithPaths[]).forEach((table) => {
    table.paths?.forEach((path) => {
      path.forEach((level) => {
        if (level?.id) {
          if (!subjectToTableMap.has(level.id)) {
            subjectToTableMap.set(level.id, new Set());
          }
          subjectToTableMap.get(level.id)!.add(table.id);
        }
      });
    });
  });

  function updateNode(node: PathItem): PathItem {
    const count = subjectToTableMap.get(node.id)?.size ?? 0;
    return {
      ...node,
      count,
      children: node.children?.map(updateNode) ?? [],
    };
  }

  return originalTree.map(updateNode);
}

export function sortFilterChips(filters: Filter[]): Filter[] {
  const typeOrder = ['subject', 'timeUnit'];
  return filters.sort((a, b) => {
    const typeComparison =
      typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
    if (typeComparison !== 0) {
      return typeComparison;
    }
    return a.index - b.index;
  });
}

export function findParent(
  subjectTree: PathItem[],
  childId: string,
): PathItem | null {
  for (const node of subjectTree) {
    if (node.children?.some((child) => child.id === childId)) {
      return node;
    }
    if (node.children) {
      const found = findParent(node.children, childId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}
