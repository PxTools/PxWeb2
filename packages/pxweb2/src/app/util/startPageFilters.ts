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

export interface YearRange {
  min: number;
  max: number;
}

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
    yearRange: { min: 0, max: 9999 },
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

  return {
    min: Number.isFinite(minYear) ? minYear : 1900,
    max: Number.isFinite(maxYear) ? maxYear : new Date().getFullYear(),
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

export function extractYear(period: string | null | undefined): number {
  if (!period) {
    return NaN;
  }
  const match = period.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : NaN;
}

export function parseYearRange(
  filter?: { value: string; label: string },
  fromLabelText?: string,
  toLabelText?: string,
): { from?: string; to?: string } {
  if (!filter) {
    return {};
  }

  if (filter.value.includes('-')) {
    const [from, to] = filter.value.split('-');
    return { from, to };
  }

  const expectedFromLabel = `${fromLabelText ?? ''} ${filter.value}`;
  const expectedToLabel = `${toLabelText ?? ''} ${filter.value}`;

  if (filter.label === expectedFromLabel) {
    return { from: filter.value };
  }

  if (filter.label === expectedToLabel) {
    return { to: filter.value };
  }

  return { from: filter.value };
}

export function getYearRangeLabelValue(
  from?: string,
  to?: string,
  fromLabel?: string,
  toLabel?: string,
) {
  if (from && to && from !== to) {
    return { label: `${from} - ${to}`, value: `${from}-${to}` };
  } else if (from && to && from === to) {
    return { label: from, value: from };
  } else if (from) {
    const label = `${fromLabel} ${from}`;
    return { label, value: from };
  } else if (to) {
    const label = `${toLabel} ${to}`;
    return { label, value: to };
  }

  return { label: '', value: '' };
}
