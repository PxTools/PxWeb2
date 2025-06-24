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

// Find parents, and parents' parents all the way up
export function findAncestors(
  subjectTree: PathItem[],
  childId: string,
  path: PathItem[] = [],
): PathItem[] {
  for (const node of subjectTree) {
    const newPath = [...path, node];
    if (node.id === childId) {
      // Remove nested children from each subject
      return path.map((item) => ({ ...item, children: [] }));
    }
    if (node.children) {
      const result = findAncestors(node.children, childId, newPath);
      if (result.length > 0) {
        return result;
      }
    }
  }
  return [];
}

// Recursively flatten all descendants of a PathItem, including all levels
function getAllDescendants(node: PathItem): PathItem[] {
  let descendants: PathItem[] = [];
  for (const child of node.children || []) {
    descendants.push({ ...child, children: [] }); // flatten: remove children from returned objects
    descendants = descendants.concat(getAllDescendants(child));
  }
  return descendants;
}

// Find the PathItem with the Id given, and get all the descendants of that element
export function findChildren(
  subjectTree: PathItem[],
  parentId: string,
): PathItem[] {
  for (const node of subjectTree) {
    if (node.id === parentId) {
      return getAllDescendants(node);
    }
    if (node.children) {
      const found = findChildren(node.children, parentId);
      if (found.length > 0) {
        return found;
      }
    }
  }
  return [];
}
