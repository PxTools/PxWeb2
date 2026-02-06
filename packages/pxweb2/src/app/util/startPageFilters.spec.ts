import { describe, it, expect, vi } from 'vitest';

import {
  findAncestors,
  findChildren,
  sortFiltersByTypeAndSubjectOrder,
  deduplicateFiltersByValue,
  organizePaths,
  getYearRanges,
  getYearRangeFromPeriod,
  updateSubjectTreeCounts,
  buildSubjectToTableIdsMap,
  type TableWithPaths,
  getVariables,
  sortTimeUnit,
  sortSubjectTree,
  sortTablesByUpdated,
} from '../util/startPageFilters';
import { Filter, type PathItem } from '../pages/StartPage/StartPageTypes';
import { Table } from '@pxweb2/pxweb2-api-client';

const exampleResultTree: PathItem[] = [
  {
    id: 'al',
    label: 'Arbeid og lønn',
    count: 2,
    uniqueId: 'al',
    children: [
      {
        id: 'al03',
        label: 'Arbeidsledighet',
        count: 1,
        uniqueId: 'al__al03',
        children: [
          {
            id: 'aku',
            label: 'Arbeidskraftundersøkelsen',
            count: 1,
            uniqueId: 'al__al03__aku',
            children: [],
          },
        ],
      },
      {
        id: 'al06',
        label: 'Sysselsetting',
        count: 1,
        uniqueId: 'al__al06',
        children: [
          {
            id: 'aku',
            label: 'Arbeidskraftundersøkelsen',
            count: 1,
            uniqueId: 'al__al06__aku',
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'in',
    count: 1,
    label: 'Innvandring og innvandrere',
    uniqueId: 'in',
    children: [
      {
        id: 'in01',
        label: 'Arbeid og lønn',
        count: 1,
        uniqueId: 'in__in01',
        children: [
          {
            id: 'aku',
            label: 'Arbeidskraftundersøkelsen',
            children: [],
            uniqueId: 'in__in01__aku',
            count: 1,
          },
        ],
      },
    ],
  },
];

const akuExample: PathItem = {
  id: 'aku',
  label: 'Arbeidskraftundersøkelsen',
  count: 1,
  uniqueId: 'al__al06__aku',
  children: [],
};

const al06Example: PathItem = {
  id: 'al06',
  label: 'Sysselsetting',
  count: 1,
  uniqueId: 'al__al06',
  children: [],
};

const al03Example: PathItem = {
  id: 'al03',
  label: 'Arbeidsledighet',
  count: 1,
  uniqueId: 'al__al03',
  children: [],
};

const alExample: PathItem = {
  id: 'al',
  label: 'Arbeid og lønn',
  count: 2,
  uniqueId: 'al',
  children: [],
};

const inExample: PathItem = {
  id: 'in',
  count: 1,
  label: 'Innvandring og innvandrere',
  uniqueId: 'in',
  children: [],
};

const tableExamples = [
  {
    id: '1',
    label:
      'New registrations of passenger cars by region and by type of fuel. Month 2006M01-2025M07',
    description: 'NULL',
    updated: '2025-08-04T06:00:00Z',
    firstPeriod: '2006M01',
    lastPeriod: '2025M07',
    variableNames: ['region', 'fuel', 'observations', 'month'],
    source: 'Transport Analysis',
    subjectCode: 'TK',
  },
  {
    id: '2',
    label:
      'New registrations of passenger cars by region and by type of fuel. Month 2006M01-2025M07',
    description: 'NULL',
    updated: '2025-08-04T06:00:00Z',
    firstPeriod: '1920M01',
    lastPeriod: '2050M07',
    variableNames: ['region', 'fuel', 'observations', 'month'],
    source: 'Transport Analysis',
    subjectCode: 'TK',
  },
] as Table[];

// This stops working when I add uniqueID fields - they are randomly generated and are different every time. Maybe mock math.random??

describe('Test function organizePaths', () => {
  it('should organize paths into a hierarchical structure', () => {
    const paths: PathItem[][] = [
      [
        { id: 'al', label: 'Arbeid og lønn' },
        { id: 'al03', label: 'Arbeidsledighet' },
        { id: 'aku', label: 'Arbeidskraftundersøkelsen' },
      ],
      [
        { id: 'al', label: 'Arbeid og lønn' },
        { id: 'al06', label: 'Sysselsetting' },
        { id: 'aku', label: 'Arbeidskraftundersøkelsen' },
      ],
      [
        { id: 'in', label: 'Innvandring og innvandrere' },
        { id: 'in01', label: 'Arbeid og lønn' },
        { id: 'aku', label: 'Arbeidskraftundersøkelsen' },
      ],
    ];

    const result = organizePaths(paths);
    expect(result).toEqual(exampleResultTree);
  });
});

describe('Find all direct ancestors of node', () => {
  it('should find the first parent of the node', () => {
    const parents = findAncestors(exampleResultTree, 'al__al03__aku');
    expect(parents).toContainEqual(al03Example);
  });
  it('should find the second parent of the node', () => {
    const parents = findAncestors(exampleResultTree, 'al__al03__aku');
    expect(parents).toContainEqual(alExample);
  });
  it('should not find any other nodes', () => {
    const parents = findAncestors(exampleResultTree, 'al__al03__aku');
    expect(parents).not.toContainEqual(inExample);
    expect(parents).not.toContainEqual(akuExample);
  });
});

describe('Find all children of node', () => {
  it('should find the immediate children of the node', () => {
    const children = findChildren(exampleResultTree, 'al');
    expect(children).toContainEqual(al06Example);
    expect(children).toContainEqual(al03Example);
  });
  it('should find the second child of the node', () => {
    const children = findChildren(exampleResultTree, 'al');
    expect(children).toContainEqual(akuExample);
  });
});

describe('Ensure the tree flattens correctly', () => {
  const flattenedResult: PathItem[] = [
    {
      id: 'in01',
      label: 'Arbeid og lønn',
      count: 1,
      uniqueId: 'in__in01',
      children: [],
    },
    {
      id: 'aku',
      label: 'Arbeidskraftundersøkelsen',
      children: [],
      uniqueId: 'in__in01__aku',
      count: 1,
    },
  ];

  it('should find the immediate children of the node', () => {
    const children = findChildren(exampleResultTree, 'in');
    expect(children).toEqual(flattenedResult);
  });
});

describe('Correctly sort, filter and deduplicate filters', () => {
  const rawFilters: Filter[] = [
    {
      type: 'subject',
      value: 'in01',
      label: 'Arbeid og lønn',
      uniqueId: 'in__in01',
      index: 0,
    },
    {
      type: 'subject',
      value: 'aku',
      label: 'Arbeidskraftundersøkelsen',
      uniqueId: 'al__al03__aku',
      index: 0,
    },
    {
      type: 'subject',
      value: 'aku',
      label: 'Arbeidskraftundersøkelsen',
      uniqueId: 'al__al06__aku',
      index: 0,
    },
  ];

  const subjectOrder: string[] = [
    'al',
    'al__al03',
    'al__al03__aku',
    'al__al03__regledig',
    'al__al06',
    'al__al06__aku',
    'in',
    'in__in01',
    'in__in01__aku',
  ];

  const sortedFilters: Filter[] = [
    {
      type: 'subject',
      value: 'aku',
      label: 'Arbeidskraftundersøkelsen',
      uniqueId: 'al__al03__aku',
      index: 0,
    },
    {
      type: 'subject',
      value: 'aku',
      label: 'Arbeidskraftundersøkelsen',
      uniqueId: 'al__al06__aku',
      index: 0,
    },
    {
      type: 'subject',
      value: 'in01',
      label: 'Arbeid og lønn',
      uniqueId: 'in__in01',
      index: 0,
    },
  ];

  const dedupedFilters: Filter[] = [
    {
      type: 'subject',
      value: 'aku',
      label: 'Arbeidskraftundersøkelsen',
      uniqueId: 'al__al03__aku',
      index: 0,
    },
    {
      type: 'subject',
      value: 'in01',
      label: 'Arbeid og lønn',
      uniqueId: 'in__in01',
      index: 0,
    },
  ];

  it('Should sort and dedupe filter correctly', () => {
    const performedSort = sortFiltersByTypeAndSubjectOrder(
      rawFilters,
      subjectOrder,
    );
    expect(performedSort).toEqual(sortedFilters);

    const performedDeduped = deduplicateFiltersByValue(sortedFilters);
    expect(performedDeduped).toEqual(dedupedFilters);
  });

  it('Should not include filters which are in the variable exclusion list', () => {
    const variableList = getVariables(tableExamples);

    expect(variableList.has('observations')).toBe(true);
    expect(variableList.has('month')).toBe(false);
  });
});

describe('getYearRanges', () => {
  it('returns correct min and max for multiple valid tables', () => {
    expect(getYearRanges(tableExamples)).toEqual({
      min: 1920,
      max: 2050,
    });
  });

  it('returns default range on empty input array', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T12:00:00.000Z'));

    expect(getYearRanges([])).toEqual({ min: 1900, max: 2025 });

    vi.useRealTimers();
  });
});

describe('getYearRangeFromPeriod', () => {
  it('returns undefined if period is invalid', () => {
    expect(getYearRangeFromPeriod('20M')).toEqual([NaN, NaN]);
  });
  it('returns correct range for valid period', () => {
    expect(getYearRangeFromPeriod('2000-2005')).toEqual([2000, 2005]);
    expect(getYearRangeFromPeriod('2020M12')).toEqual([2020, 2020]);
    expect(getYearRangeFromPeriod('2010')).toEqual([2010, 2010]);
  });
  it('returns undefined if period is empty', () => {
    expect(getYearRangeFromPeriod('')).toEqual([NaN, NaN]);
  });
});

describe('updateSubjectTreeCounts', () => {
  const tableA = {
    id: 'tableA',
    paths: [
      [
        { id: 'A', label: 'A' },
        { id: 'AA', label: 'AA' },
      ],
    ],
  } as TableWithPaths;

  const tableB = {
    id: 'tableB',
    paths: [[{ id: 'B', label: 'B' }]],
  } as TableWithPaths;

  const tableC = {
    id: 'tableC',
    paths: [
      [
        { id: 'A', label: 'A' },
        { id: 'B', label: 'B' },
      ],
    ],
  } as TableWithPaths;

  const subjectTree = [
    {
      id: 'A',
      label: 'A',
      children: [
        {
          id: 'AA',
          label: 'AA',
        },
      ],
    },
    {
      id: 'B',
      label: 'B',
      children: [
        {
          id: 'BB',
          label: 'BB',
        },
      ],
    },
  ];

  it('counts tables on self and children (with rollup)', () => {
    const result = updateSubjectTreeCounts(subjectTree, [
      tableA,
      tableB,
      tableC,
    ]);

    const subjectA = result[0];
    const subjectAA = subjectA.children?.[0];

    expect(subjectAA?.id).toBe('AA');
    expect(subjectAA?.count).toBe(1);

    expect(subjectA.id).toBe('A');
    expect(subjectA.count).toBe(2);
  });

  it('handles rollup correctly without double-counting shared table across parent and child', () => {
    const sharedTable = {
      id: 't1',
      paths: [
        [
          { id: 'A', label: 'A' },
          { id: 'AA', label: 'AA' },
        ],
      ],
    } as TableWithPaths;

    const subjectTree = [
      {
        id: 'A',
        label: 'A',
        children: [
          {
            id: 'AA',
            label: 'AA',
          },
        ],
      },
    ];

    const result = updateSubjectTreeCounts(subjectTree, [sharedTable]);

    const subjectA = result[0];
    const subjectAA = subjectA.children?.[0];

    expect(subjectAA?.id).toBe('AA');
    expect(subjectAA?.count).toBe(1); // direct match
    expect(subjectA.count).toBe(1); // same table, rolled up, not double-counted
  });

  it('returns 0 count for unmatched nodes', () => {
    const result = updateSubjectTreeCounts(subjectTree, []);
    expect(result[0].count).toBe(0);
    expect(result[0].children?.[0].count).toBe(0);
  });
});

describe('buildSubjectToTableIdsMap', () => {
  it('handles multiple tables with duplicate subject ids in paths', () => {
    const tables = [
      {
        id: 't1',
        paths: [
          [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B' },
          ],
          [{ id: 'A', label: 'A' }],
        ],
      },
      {
        id: 't2',
        paths: [[{ id: 'B', label: 'B' }]],
      },
    ];

    const map = buildSubjectToTableIdsMap(tables as Table[]);
    expect(map.get('A')?.size).toBe(1);
    expect(map.get('B')?.size).toBe(2);
  });

  it('returns empty map for tables with no paths', () => {
    const map = buildSubjectToTableIdsMap([{ id: 't1' }] as TableWithPaths[]);
    expect(map.size).toBe(0);
  });
});

describe('sortTimeUnit (Set version)', () => {
  it('sorts known units in predefined order', () => {
    const input = new Set([
      'Monthly',
      'Annual',
      'Other',
      'Weekly',
      'Quarterly',
    ]);
    const sorted = sortTimeUnit(input);
    expect(sorted).toEqual([
      'Annual',
      'Quarterly',
      'Monthly',
      'Weekly',
      'Other',
    ]);
  });

  it('places unknown units at the end', () => {
    const input = new Set(['Monthly', 'Daily', 'Annual', 'BiWeekly', 'Weekly']);
    const sorted = sortTimeUnit(input);

    expect(sorted).toEqual([
      'Annual',
      'Monthly',
      'Weekly',
      'Daily',
      'BiWeekly',
    ]);
  });

  it('handles empty input', () => {
    const input = new Set<string>();
    const sorted = sortTimeUnit(input);
    expect(sorted).toEqual([]);
  });

  it('handles subset of known values', () => {
    const input = new Set(['Weekly', 'Annual']);
    const sorted = sortTimeUnit(input);
    expect(sorted).toEqual(['Annual', 'Weekly']);
  });
});

describe('sortSubjectTreeAlpha', () => {
  it('sorts siblings at top level alphabetically', () => {
    const subjects = [
      { id: '2', label: 'Transport' },
      { id: '3', label: 'Agriculture' },
      { id: '1', label: 'Business' },
    ];

    const sorted = sortSubjectTree(subjects);

    expect(sorted.map((n) => n.label)).toEqual([
      'Agriculture',
      'Business',
      'Transport',
    ]);
  });

  it('sorts children recursively at each depth', () => {
    const subjects = [
      {
        id: 'A',
        label: 'Alpha',
        children: [
          { id: 'A2', label: 'Zebra' },
          { id: 'A1', label: 'Beta' },
          {
            id: 'A3',
            label: 'Delta',
            children: [
              { id: 'A3b', label: 'Gamma' },
              { id: 'A3a', label: 'Alpha' },
            ],
          },
        ],
      },
      {
        id: 'B',
        label: 'Bravo',
        children: [
          { id: 'B2', label: 'Lima' },
          { id: 'B1', label: 'Echo' },
        ],
      },
    ];

    const sorted = sortSubjectTree(subjects);

    // Toplevel
    expect(sorted.map((n) => n.label)).toEqual(['Alpha', 'Bravo']);

    // Level 2 - Alpha-branch
    const alphaKids = sorted[0].children!;
    expect(alphaKids.map((n) => n.label)).toEqual(['Beta', 'Delta', 'Zebra']);

    // Lecel 3 - Alpha → Delta-branch
    const deltaKids = alphaKids.find((n) => n.label === 'Delta')!.children!;
    expect(deltaKids.map((n) => n.label)).toEqual(['Alpha', 'Gamma']);
  });
});

describe('sortSubjectTree comparator by depth', () => {
  it('uses label comparator at depth 1 (top-level)', () => {
    const subjects = [
      { id: 'b', label: 'Bravo', sortCode: '001' },
      { id: 'a', label: 'Alpha', sortCode: '999' },
      { id: 'c', label: 'Charlie', sortCode: '000' },
    ];

    const sorted = sortSubjectTree(subjects);
    expect(sorted.map((n) => n.label)).toEqual(['Alpha', 'Bravo', 'Charlie']); // label asc
  });

  it('uses label comparator up to depth 3', () => {
    const subjects = [
      {
        id: 'A',
        label: 'Alpha',
        children: [
          { id: 'A2', label: 'Zebra' },
          { id: 'A1', label: 'Beta' },
          {
            id: 'A3',
            label: 'Delta',
            children: [
              { id: 'A3b', label: 'Gamma' },
              { id: 'A3a', label: 'Alpha' },
            ],
          },
        ],
      },
      {
        id: 'B',
        label: 'Bravo',
        children: [
          { id: 'B2', label: 'Lima' },
          { id: 'B1', label: 'Echo' },
        ],
      },
    ];

    const sorted = sortSubjectTree(subjects);

    // Depth 1
    expect(sorted.map((n) => n.label)).toEqual(['Alpha', 'Bravo']);

    // Depth 2 - Alpha branch
    const alphaBranch = sorted[0].children!;
    expect(alphaBranch.map((n) => n.label)).toEqual(['Beta', 'Delta', 'Zebra']);

    // Depth 3 - Alpha → Delta branch
    const deltaBranch = alphaBranch.find((n) => n.label === 'Delta')!.children!;
    expect(deltaBranch.map((n) => n.label)).toEqual(['Alpha', 'Gamma']);
  });

  it('uses sortCode then label comparator at depth 4', () => {
    const level4Children = [
      { id: 'c', label: 'C', sortCode: '2' }, // 2
      { id: 'a', label: 'A', sortCode: '001' }, // 1
      { id: 'z', label: 'Z', sortCode: '010' }, // 10
      { id: 'b', label: 'B', sortCode: undefined }, // invalid -> after valids
    ];
    const subjects = [
      {
        id: 'root',
        label: 'Root',
        children: [
          {
            id: 'l2',
            label: 'Level2',
            children: [{ id: 'l3', label: 'Level3', children: level4Children }],
          },
        ],
      },
    ];

    const sorted = sortSubjectTree(subjects);
    const lvl4 = sorted[0].children![0].children![0].children!;
    expect(lvl4.map((n) => n.label)).toEqual(['A', 'C', 'Z', 'B']);
  });

  it('uses sortCode comparator and label tie-breaker at depth 5', () => {
    const level5Children = [
      { id: 'a', label: 'Alpha', sortCode: '5' },
      { id: 'c', label: 'Charlie', sortCode: '1' },
      { id: 'b', label: 'Bravo', sortCode: '1' },
    ];
    const subjects = [
      {
        id: 'root',
        label: 'Root',
        children: [
          {
            id: 'l2',
            label: 'Level2',
            children: [
              {
                id: 'l3',
                label: 'Level3',
                children: [
                  { id: 'l4', label: 'Level4', children: level5Children },
                ],
              },
            ],
          },
        ],
      },
    ];

    const sorted = sortSubjectTree(subjects);
    const lvl5 = sorted[0].children![0].children![0].children![0].children!;
    expect(lvl5.map((n) => n.label)).toEqual(['Bravo', 'Charlie', 'Alpha']); // tie-break by label
  });

  it('keeps original order deeper than level 5 (depth 6+)', () => {
    const level6Children = [
      { id: 'c1', label: 'Bravo', sortCode: '001' },
      { id: 'c2', label: 'Alpha', sortCode: '0' },
      { id: 'c3', label: 'Charlie', sortCode: '999' },
    ];
    const subjects = [
      {
        id: 'root',
        label: 'Root',
        children: [
          {
            id: 'l2',
            label: 'X',
            children: [
              {
                id: 'l3',
                label: 'Y',
                children: [
                  {
                    id: 'l4',
                    label: 'Z',
                    children: [
                      { id: 'l5', label: 'W', children: level6Children },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const sorted = sortSubjectTree(subjects);
    const lvl6 =
      sorted[0].children![0].children![0].children![0].children![0].children!;
    expect(lvl6.map((n) => n.label)).toEqual(['Bravo', 'Alpha', 'Charlie']); // insertion order preserved
  });
});

describe('compareBySortCodeThenLabelAsc (via sortSubjectTree at depth 4)', () => {
  const makeTreeWithLevel4 = (children: PathItem[]) => [
    {
      id: 'root',
      label: 'Root',
      children: [
        {
          id: 'l2',
          label: 'Level2',
          children: [{ id: 'l3', label: 'Level3', children: children }],
        },
      ],
    },
  ];

  it('sorts valid numeric sort codes ascending', () => {
    const children = [
      { id: 'b', label: 'B', sortCode: '010' },
      { id: 'a', label: 'A', sortCode: '2' },
      { id: 'c', label: 'C', sortCode: '001' }, // parsed as 1
    ];
    const subjects = makeTreeWithLevel4(children);

    const sorted = sortSubjectTree(subjects);
    const lvl4 = sorted[0].children![0].children![0].children!;
    expect(lvl4.map((n) => n.label)).toEqual(['C', 'A', 'B']); // 1, 2, 10
  });

  it('places invalid/missing sort codes after valid ones and falls back to label', () => {
    const children = [
      { id: 'a', label: 'Alpha', sortCode: undefined }, // invalid
      { id: 'b', label: 'Bravo', sortCode: '3' }, // valid
      { id: 'c', label: 'Charlie', sortCode: 'notdigits' }, // invalid
    ];
    const subjects = makeTreeWithLevel4(children);

    const sorted = sortSubjectTree(subjects);
    const lvl4 = sorted[0].children![0].children![0].children!;
    expect(lvl4.map((n) => n.label)).toEqual(['Bravo', 'Alpha', 'Charlie']);
  });

  it('uses label as tie-breaker when sort codes are equal', () => {
    const children = [
      { id: 'b', label: 'Bravo', sortCode: '5' },
      { id: 'a', label: 'Alpha', sortCode: '5' },
      { id: 'c', label: 'Charlie', sortCode: '5' },
    ];
    const subjects = makeTreeWithLevel4(children);

    const sorted = sortSubjectTree(subjects);
    const lvl4 = sorted[0].children![0].children![0].children!;
    expect(lvl4.map((n) => n.label)).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('trims whitespace and treats non-digit strings as invalid', () => {
    const children = [
      { id: 'a', label: 'A', sortCode: '  4 ' }, // valid after trim
      { id: 'b', label: 'C', sortCode: '   ' }, // invalid after trim -> empty
      { id: 'c', label: 'B', sortCode: '-1' }, // invalid (non-digit)
    ];
    const subjects = makeTreeWithLevel4(children);

    const sorted = sortSubjectTree(subjects);
    const lvl4 = sorted[0].children![0].children![0].children!;
    expect(lvl4.map((n) => n.label)).toEqual(['A', 'B', 'C']); // 4, then invalids by label
  });
});

describe('sortTablesByUpdated (date-only, newest first)', () => {
  const createTable = (overrides: Partial<Table> = {}): Table =>
    ({
      id: Math.random().toString(36).slice(2),
      label: overrides.label ?? 'Some table',
      updated: overrides.updated,
      firstPeriod: overrides.firstPeriod ?? '2000',
      lastPeriod: overrides.lastPeriod ?? '2001',
      timeUnit: overrides.timeUnit ?? 'Annual',
      variableNames: overrides.variableNames ?? [],
      source: overrides.source ?? 'SSB',
      paths: overrides.paths ?? [],
      ...overrides,
    }) as unknown as Table;

  it('sort on updated DESC (newest first)', () => {
    const a = createTable({ id: 'a', updated: '2023-01-01T00:00:00Z' });
    const b = createTable({ id: 'b', updated: '2025-07-15T12:34:56Z' }); // newest
    const c = createTable({ id: 'c', updated: '2024-12-31T23:59:59Z' });

    const out = sortTablesByUpdated([a, b, c]);
    expect(out.map((t) => t.id)).toEqual(['b', 'c', 'a']);
  });

  it('sorts same dates by subjectCode', () => {
    const a = createTable({
      id: 'a',
      updated: '2025-01-01T00:00:00Z',
      subjectCode: 'zz',
    });
    const b = createTable({
      id: 'b',
      updated: '2025-01-01T00:00:00Z',
      subjectCode: 'aa',
    });
    const c = createTable({
      id: 'c',
      updated: '2025-01-01T00:00:00Z',
      subjectCode: 'mm',
    });
    const d = createTable({
      id: 'd',
      updated: '2025-01-01T00:00:00Z',
      subjectCode: undefined,
    });
    const e = createTable({
      id: 'e',
      updated: '2025-01-01T00:00:00Z',
      subjectCode: 'aa',
    });

    const out = sortTablesByUpdated([a, b, c, d, e]);
    expect(out.map((t) => t.id)).toEqual(['b', 'e', 'c', 'a', 'd']);
  });

  it('places missing/invalid date at the bottom', () => {
    const newest = createTable({
      id: 'newest',
      updated: '2025-08-05T06:00:00Z',
    });
    const invalid = createTable({
      id: 'invalid',
      updated: 'not-a-date' as unknown as string,
    });
    const missing = createTable({ id: 'missing', updated: undefined });

    const out = sortTablesByUpdated([invalid, newest, missing]);
    expect(out.map((t) => t.id)).toEqual(['newest', 'invalid', 'missing']);
  });

  it('does not mutate the original array', () => {
    const a = createTable({ id: 'a', updated: '2024-01-01T00:00:00Z' });
    const b = createTable({ id: 'b', updated: '2025-01-01T00:00:00Z' });
    const input = [a, b];
    const snapshot = [...input];

    const out = sortTablesByUpdated(input);

    expect(input).toEqual(snapshot);
    expect(out).not.toBe(input);
  });

  it('handles ISO date without time', () => {
    const d1 = createTable({ id: 'd1', updated: '2024-05-01' });
    const d2 = createTable({ id: 'd2', updated: '2025-03-10' });

    const out = sortTablesByUpdated([d1, d2]);
    expect(out.map((t) => t.id)).toEqual(['d2', 'd1']);
  });

  it('preserves original order when updated is equal', () => {
    const a = createTable({ id: 'a', updated: '2025-01-01T00:00:00Z' });
    const b = createTable({ id: 'b', updated: '2025-01-01T00:00:00Z' });
    const c = createTable({ id: 'c', updated: '2025-01-01T00:00:00Z' });

    const out = sortTablesByUpdated([a, b, c]);
    expect(out.map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });
});
