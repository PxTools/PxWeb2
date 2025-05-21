import { Table } from '@pxweb2/pxweb2-api-client';
import { StartPageFilters } from '../pages/StartPage/StartPageTypes';

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
  return organizePaths(allPaths);
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
    yearRange: { min: 1900, max: 2025 },
    timeUnits: new Map<string, number>(),
    subjectTree: [],
  };

  console.log(getYearRanges(tables));

  filters.timeUnits = getTimeUnits(tables);
  filters.subjectTree = getSubjectTree(tables);
  filters.yearRange = getYearRanges(tables);

  return filters;
}

export function getSubjectTreeFromAllTables(allTables: Table[]): PathItem[] {
  return getSubjectTree(allTables);
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

  // Oppdater counts i emnetreet
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

export function getSubjectLevel(
  tree: PathItem[],
  targetId: string,
  currentLevel: number = 0,
): number | null {
  for (const node of tree) {
    if (node.id === targetId) {
      return currentLevel;
    }
    if (node.children?.length) {
      const level = getSubjectLevel(node.children, targetId, currentLevel + 1);
      if (level !== null) {
        return level;
      }
    }
  }
  return null;
}

export function getSubjectsAtLevel(
  tree: PathItem[],
  targetLevel: number,
  currentLevel: number = 0,
): PathItem[] {
  let result: PathItem[] = [];

  for (const node of tree) {
    if (currentLevel === targetLevel) {
      result.push(node);
    } else if (node.children?.length) {
      result = result.concat(
        getSubjectsAtLevel(node.children, targetLevel, currentLevel + 1),
      );
    }
  }

  return result;
}

export function getYearRanges(tables: Table[]): YearRange {
  const yearsPeriod: number[] = [];
  tables.forEach((table) => {
    if (table.firstPeriod && table.lastPeriod) {
      yearsPeriod.push(extractYear(table.firstPeriod));
      yearsPeriod.push(extractYear(table.lastPeriod));
    }
  });
  return {
    min: Math.min(...yearsPeriod),
    max: Math.max(...yearsPeriod),
  };
}

export const extractYearOld = (period: string | null | undefined): number => {
  const yearStr = period?.substring(0, 4);
  const parsed = parseInt(yearStr ?? '', 10);
  return isNaN(parsed) ? 0 : parsed;
};

export function extractYear(period: string | null | undefined): number {
  if (!period) {
    return NaN;
  }
  const match = period.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : NaN;
}
