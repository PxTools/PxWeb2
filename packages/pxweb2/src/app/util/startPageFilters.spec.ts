import { describe, it, expect } from 'vitest';
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

const tableExamles = [
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

describe('Correctly sort and deduplicate filters', () => {
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
});

describe('getYearRanges', () => {
  it('returns correct min and max for multiple valid tables', () => {
    expect(getYearRanges(tableExamles)).toEqual({
      min: 1920,
      max: 2050,
    });
  });

  it('throws on empty input array', () => {
    expect(getYearRanges([])).toEqual({ min: 1900, max: 2025 });
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
