import { Table } from '@pxweb2/pxweb2-api-client';
import { useTranslation } from 'react-i18next';
import {
  StartPageFilters,
  Filter,
  FilterType,
  PathItem,
  YearRange,
} from '../pages/StartPage/StartPageTypes';
import { shouldTableBeIncluded } from '../util/tableHandler';
import { getConfig } from './config/getConfig';
import i18n from '../../i18n/config';

export type TableWithPaths = Table & {
  id: string;
  paths?: { id: string; label: string }[][];
};

export function getSubjectTree(tables: Table[]): PathItem[] {
  const allPaths: PathItem[][] = getAllPath(tables);
  const organizedPaths: PathItem[] = organizePaths(allPaths);
  const sortedAndOranizedPaths = sortSubjectTree(organizedPaths);
  return updateSubjectTreeCounts(sortedAndOranizedPaths, tables);
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
          sortCode: item.sortCode,
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
    variables: new Map<string, number>(),
    status: new Map<'active' | 'discontinued', number>(),
  };

  filters.timeUnits = getTimeUnits(tables);
  filters.subjectTree = getSubjectTree(tables);
  filters.variables = getVariables(tables);

  return filters;
}

export function updateSubjectTreeCounts(
  subjectTree: PathItem[],
  tables: TableWithPaths[],
): PathItem[] {
  const subjectToTableIds = buildSubjectToTableIdsMap(tables);

  const countTablesForSubjectNode = (
    node: PathItem,
  ): [PathItem, Set<string>] => {
    const tableIdsForThisNode = new Set(subjectToTableIds.get(node.id) ?? []);
    const tableIdsInChildren = new Set<string>();
    const updatedChildren: PathItem[] = [];

    for (const child of node.children ?? []) {
      const [updatedChild, childTableIds] = countTablesForSubjectNode(child);
      updatedChildren.push(updatedChild);
      for (const id of childTableIds) {
        tableIdsInChildren.add(id);
      }
    }

    const combinedTableIds = new Set([
      ...tableIdsForThisNode,
      ...tableIdsInChildren,
    ]);

    const updatedNode: PathItem = {
      ...node,
      count: combinedTableIds.size,
      children: updatedChildren.length ? updatedChildren : undefined,
    };

    return [updatedNode, combinedTableIds];
  };

  return subjectTree.map((node) => countTablesForSubjectNode(node)[0]);
}

export function sortFiltersByTypeAndSubjectOrder(
  filters: Filter[],
  subjectOrder: string[],
): Filter[] {
  const typeOrder = ['search', 'subject', 'yearRange', 'timeUnit', 'variable'];

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

    if (a.type === 'variable' && b.type === 'variable') {
      return a.index - b.index;
    }

    return 0;
  });
}

export function deduplicateFiltersByValue(filters: Filter[]): Filter[] {
  const seen = new Set<string>();
  return filters.filter((filter) => {
    if (filter.type == 'search') {
      return true;
    }
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
  const statusTables = tablesForFilterCounts(
    'status',
    currentFilters,
    availableTables,
  );
  // We do not calculate variables, they are always updated - even when adding variable filters!

  const shouldRecalcFilter = (filter: FilterType) =>
    editFilterType !== filter || currentFilters.some((f) => f.type !== filter);

  return {
    subjectTree: shouldRecalcFilter('subject')
      ? updateSubjectTreeCounts(originalSubjectTree, subjectTables)
      : undefined,
    timeUnits: shouldRecalcFilter('timeUnit')
      ? getTimeUnits(timeUnitTables)
      : undefined,
    yearRange: shouldRecalcFilter('yearRange')
      ? getYearRanges(yearRangeTables)
      : undefined,
    status: shouldRecalcFilter('status') ? getStatus(statusTables) : undefined,
  };
}

function collectUniqueSubjectIdsFromTable(table: TableWithPaths): string[] {
  const uniqueSubjectIds = new Set<string>();
  if (!table.paths) {
    return [];
  }
  for (const path of table.paths) {
    if (!path) {
      continue;
    }
    for (const segment of path) {
      if (segment?.id) {
        uniqueSubjectIds.add(segment.id);
      }
    }
  }
  return [...uniqueSubjectIds];
}

export function buildSubjectToTableIdsMap(
  tables: TableWithPaths[],
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const table of tables) {
    const subjectIds = collectUniqueSubjectIdsFromTable(table);
    for (const id of subjectIds) {
      let tableIds = map.get(id);
      if (!tableIds) {
        tableIds = new Set<string>();
        map.set(id, tableIds);
      }
      tableIds.add(table.id);
    }
  }
  return map;
}

export function getVariables(allTables: Table[]) {
  const config = getConfig();
  const exclusionList: string[] = config.variableFilterExclusionList[
    i18n.language
  ] ?? [''];

  const variables = new Map<string, number>();
  allTables.forEach((table) => {
    table.variableNames.forEach((name: string) => {
      const count = variables.get(name);
      variables.set(name, count ? count + 1 : 1);
    });
  });
  return new Map<string, number>(
    [...variables.entries()]
      // Sort the returned map by number of available variables.
      .sort((a, b) => b[1] - a[1])
      .filter((entry) => {
        // Returns true if the variable is _not_ in the exclusion list
        return !exclusionList.includes(entry[0]);
      }),
  );
}

export function getYearLabels(t: ReturnType<typeof useTranslation>['t']) {
  const fromLabel = t('start_page.filter.year.from_label');
  const toLabel = t('start_page.filter.year.to_label');

  return { fromLabel, toLabel };
}

export function getYearRangeLabelValue(
  from?: string,
  to?: string,
  fromLabel?: string,
  toLabel?: string,
) {
  if (from && to) {
    return { label: `${from}–${to}`, value: `${from}-${to}` };
  } else if (from) {
    const label = `${fromLabel} ${from}`;
    return { label, value: from };
  } else if (to) {
    const label = `${toLabel} ${to}`;
    return { label, value: to };
  }

  return { label: '', value: '' };
}

export function sortTimeUnit(allTimeUnits: Set<string>): string[] {
  const timeUnitOrder = ['Annual', 'Quarterly', 'Monthly', 'Weekly', 'Other'];

  return Array.from(allTimeUnits).sort((a, b) => {
    const indexA = timeUnitOrder.indexOf(a);
    const indexB = timeUnitOrder.indexOf(b);

    // Values not in predefined order go to the end
    return (
      (indexA === -1 ? timeUnitOrder.length : indexA) -
      (indexB === -1 ? timeUnitOrder.length : indexB)
    );
  });
}

/**
 * Parses a non-negative integer sort code from a string.
 * - Trims whitespace.
 * - Accepts only digits (e.g., "0", "12", "0012").
 * - Returns +Infinity for missing/invalid values so they sort last.
 */
function parseSortCode(sortCode: string | undefined): number {
  const INVALID = Number.POSITIVE_INFINITY;
  const s = (sortCode ?? '').trim();

  if (!/^\d+$/.test(s)) {
    return INVALID;
  }

  return Number(s);
}

/**
 * Comparator for PathItem that sorts by numeric sortCode (ascending), then by label.
 * - Parses sortCode via parseSortCode (digits-only, trimmed).
 * - Missing/invalid sort codes are treated as +Infinity and therefore sort last.
 * - If both sort codes are missing/invalid, falls back to label (ascending).
 * - If numeric sort codes are equal, uses label (ascending) as a stable tie-breaker.
 * - For Array.prototype.sort: negative => a before b, positive => b before a, 0 => equal.
 * - Label comparison is delegated to compareByLabelAsc.
 */
function compareBySortCodeThenLabelAsc(a: PathItem, b: PathItem): number {
  const sortA = parseSortCode(a.sortCode);
  const sortB = parseSortCode(b.sortCode);

  // Check validity of sort codes
  const aValid = Number.isFinite(sortA);
  const bValid = Number.isFinite(sortB);

  // Both invalid/missing -> compare by label
  if (!aValid && !bValid) {
    return compareByLabelAsc(a, b);
  }

  // Only A invalid -> A after B
  if (!aValid) {
    return 1;
  }

  // Only B invalid -> B after A
  if (!bValid) {
    return -1;
  }

  // Both valid -> numeric first, label as tie-breaker
  if (sortA === sortB) {
    return compareByLabelAsc(a, b); // stable tie-breaker
  }

  return sortA - sortB;
}

function compareByLabelAsc(a: PathItem, b: PathItem): number {
  const la = a.label;
  const lb = b.label;
  if (la < lb) {
    return -1;
  }
  if (la > lb) {
    return 1;
  }
  return 0;
}

// Sort subjects alphabetically at every depth.
export function sortSubjectTree(subjects: PathItem[]): PathItem[] {
  const sortRec = (nodes: PathItem[]): PathItem[] =>
    nodes
      .slice()
      .sort(compareBySortCodeThenLabelAsc)
      .map((node) => ({
        ...node,
        children: node.children ? sortRec(node.children) : undefined,
      }));

  return sortRec(subjects);
}

export function sortTablesByUpdated(tables: Table[]): Table[] {
  return tables.slice().sort((a, b) => {
    const dateA = Date.parse(a.updated ?? '');
    const dateB = Date.parse(b.updated ?? '');
    const isValidA = !isNaN(dateA);
    const isValidB = !isNaN(dateB);

    // Both invalid/missing -> keep original order
    if (!isValidA && !isValidB) {
      return 0;
    }
    // Only A invalid -> B comes first
    if (!isValidA) {
      return 1;
    }
    // Only B invalid -> A comes first
    if (!isValidB) {
      return -1;
    }
    // Both valid -> newer first
    return dateB - dateA;
  });
}

export function getStatus(
  tables: Table[],
): Map<'active' | 'discontinued', number> {
  const discontinued = tables.filter((t) => t.discontinued === true).length;
  const active = tables.length - discontinued;
  return new Map([
    ['active', active],
    ['discontinued', discontinued],
  ]);
}
