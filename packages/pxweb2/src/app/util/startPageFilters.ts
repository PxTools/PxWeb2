import { Table } from '@pxweb2/pxweb2-api-client';
import {
  StartPageFilters,
  Filter,
  FilterType,
  PathItem,
  YearRange,
} from '../pages/StartPage/StartPageTypes';
import { shouldTableBeIncluded } from '../util/tableHandler';

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
    let idPath: string[] = [];

    path.forEach((item) => {
      let existingItem = currentLevel.find((x) => x.id === item.id);
      idPath.push(item.id);
      const fullId = idPath.join('__');

      if (existingItem) {
        existingItem.count && existingItem.count++;
        currentLevel = existingItem.children || [];
      } else {
        const newItem: PathItem = {
          id: item.id,
          label: item.label,
          children: [],
          count: 1,
          uniqueId: fullId,
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
    yearRange: { min: 0, max: 9999 },
  };

  filters.timeUnits = getTimeUnits(tables);
  filters.subjectTree = getSubjectTree(tables);

  return filters;
}

export function updateSubjectTreeCounts(
  subjectTree: PathItem[],
  tables: TableWithPaths[],
  options?: { rollupDescendants?: boolean },
): PathItem[] {
  const rollup = options?.rollupDescendants ?? false;

  const counts = new Map<string, Set<string>>();
  for (const table of tables) {
    const ids = collectSubjectIds(table);
    for (const id of ids) {
      let s = counts.get(id);
      if (!s) {
        s = new Set<string>();
        counts.set(id, s);
      }
      s.add(table.id);
    }
  }

  const mapWithCounts = (nodes: PathItem[]): [PathItem[], Set<string>] => {
    const out: PathItem[] = [];
    const unionForSiblings = new Set<string>();

    for (const node of nodes) {
      const selfSet = new Set<string>(counts.get(node.id) ?? []);
      let childrenCloned: PathItem[] | undefined;
      let subtreeSet = new Set<string>(selfSet);

      if (node.children?.length) {
        const [cloned, childUnion] = mapWithCounts(node.children);
        childrenCloned = cloned;
        if (rollup) {
          for (const tid of childUnion) {
            subtreeSet.add(tid);
          }
        }
      }

      const count = rollup ? subtreeSet.size : selfSet.size;
      out.push({
        ...node,
        count,
        children: childrenCloned,
      });

      const toAccumulate = rollup ? subtreeSet : selfSet;
      for (const tid of toAccumulate) {
        unionForSiblings.add(tid);
      }
    }

    return [out, unionForSiblings];
  };

  const [withCounts] = mapWithCounts(subjectTree);
  return withCounts;
}

export function sortFiltersByTypeAndSubjectOrder(
  filters: Filter[],
  subjectOrder: string[],
): Filter[] {
  const typeOrder = ['subject', 'yearRange', 'timeUnit'];

  return filters.slice().sort((a, b) => {
    const typeComparison =
      typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
    if (typeComparison !== 0) {
      return typeComparison;
    }

    if (a.type === 'subject' && b.type === 'subject') {
      const aIdx = subjectOrder.indexOf(a.uniqueId ?? '');
      const bIdx = subjectOrder.indexOf(b.uniqueId ?? '');
      return aIdx - bIdx;
    }

    return 0;
  });
}

export function deduplicateFiltersByValue(filters: Filter[]): Filter[] {
  const seen = new Set<string>();
  return filters.filter((filter) => {
    if (seen.has(filter.value)) {
      return false;
    }
    seen.add(filter.value);
    return true;
  });
}

export function sortAndDeduplicateFilterChips(
  filters: Filter[],
  subjectOrder: string[],
): Filter[] {
  const sorted = sortFiltersByTypeAndSubjectOrder(filters, subjectOrder);
  return deduplicateFiltersByValue(sorted);
}

// Find parents, and parents' parents all the way up
export function findAncestors(
  subjectTree: PathItem[],
  childUniqueId: string,
  path: PathItem[] = [],
): PathItem[] {
  for (const node of subjectTree) {
    const newPath = [...path, node];
    if (node.uniqueId === childUniqueId) {
      // Remove nested children from each subject
      return path.map((item) => ({ ...item, children: [] }));
    }
    if (node.children) {
      const result = findAncestors(node.children, childUniqueId, newPath);
      if (result.length > 0) {
        return result;
      }
    }
  }
  return [];
}

// Recursively flatten all descendants of a PathItem, including all levels
export function getAllDescendants(node: PathItem): PathItem[] {
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

export function getYearRanges(tables: Table[]): YearRange {
  let minYear = Infinity;
  let maxYear = -Infinity;

  for (const table of tables) {
    const [startFrom, startTo] = getYearRangeFromPeriod(
      table.firstPeriod ?? '',
    );
    const [endFrom, endTo] = getYearRangeFromPeriod(table.lastPeriod ?? '');
    const tableMin = Math.min(startFrom, endFrom);
    const tableMax = Math.max(startTo, endTo);

    if (Number.isFinite(tableMin)) {
      minYear = Math.min(minYear, tableMin);
    }
    if (Number.isFinite(tableMax)) {
      maxYear = Math.max(maxYear, tableMax);
    }
  }

  if (!Number.isFinite(minYear) || !Number.isFinite(maxYear)) {
    return { min: 1900, max: new Date().getFullYear() };
  }

  return {
    min: minYear,
    max: maxYear,
  };
}

export function getYearRangeFromPeriod(period: string): [number, number] {
  const rangeRegex = /^(\d{4})-(\d{4})$/;
  const singleYearRegex = /^(\d{4})/;

  const rangeMatch = rangeRegex.exec(period);
  if (rangeMatch) {
    return [parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10)];
  }

  const yearMatch = singleYearRegex.exec(period);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    return [year, year];
  }
  return [NaN, NaN];
}

export function flattenSubjectTreeToList(subjectTree: PathItem[]): string[] {
  const result: string[] = [];

  function traverseTree(nodes: PathItem[]) {
    for (const node of nodes) {
      if (node.uniqueId) {
        result.push(node.uniqueId);
      }
      if (node.children?.length) {
        traverseTree(node.children);
      }
    }
  }

  traverseTree(subjectTree);
  return result;
}

export function shouldRecalcFilter(
  editedType: FilterType | undefined,
  targetFilter: FilterType,
  currentFilters: Filter[],
): boolean {
  if (editedType !== targetFilter) {
    return true;
  }
  return currentFilters.some((f) => f.type !== targetFilter);
}

export function tablesForFilterCounts(
  targetFilter: FilterType,
  currentFilters: Filter[],
  availableTables: Table[],
): Table[] {
  const activeTypes = new Set(currentFilters.map((f) => f.type));
  const onlyThisTypeActive =
    activeTypes.size === 1 && activeTypes.has(targetFilter);

  if (onlyThisTypeActive) {
    return availableTables;
  }
  const minusThisFacet = filtersExcludingType(currentFilters, targetFilter);
  return availableTables.filter((t) =>
    shouldTableBeIncluded(t, minusThisFacet),
  );
}

function filtersExcludingType(filters: Filter[], type: FilterType): Filter[] {
  return filters.filter((f) => f.type !== type);
}

export function recomputeAvailableFilters(
  editFilterType: FilterType | undefined,
  currentFilters: Filter[],
  availableTables: Table[],
  originalSubjectTree: PathItem[],
) {
  const subjectTables = tablesForFilterCounts(
    'subject',
    currentFilters,
    availableTables,
  );
  const timeUnitTables = tablesForFilterCounts(
    'timeUnit',
    currentFilters,
    availableTables,
  );
  const yearRangeTables = tablesForFilterCounts(
    'yearRange',
    currentFilters,
    availableTables,
  );

  const shouldRecalcFilter = (filter: FilterType) =>
    editFilterType !== filter || currentFilters.some((f) => f.type !== filter);

  return {
    subjectTree: shouldRecalcFilter('subject')
      ? updateSubjectTreeCounts(originalSubjectTree, subjectTables, {
          rollupDescendants: true,
        })
      : undefined,
    timeUnits: shouldRecalcFilter('timeUnit')
      ? getTimeUnits(timeUnitTables)
      : undefined,
    yearRange: shouldRecalcFilter('yearRange')
      ? getYearRanges(yearRangeTables)
      : undefined,
  };
}

function collectSubjectIds(table: TableWithPaths): string[] {
  const seen = new Set<string>();
  const paths = table.paths;
  if (!paths) {
    return [];
  }
  for (const path of paths) {
    if (!path) {
      continue;
    }
    for (const p of path) {
      if (p?.id) {
        seen.add(p.id);
      }
    }
  }
  return [...seen];
}
