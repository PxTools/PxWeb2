import { vi } from 'vitest';

import {
  buildCompiledMatcher,
  getAllTables,
  queryTablesByKeyword,
  shouldTableBeIncluded,
  shouldTableBeIncludedWithMatcher,
} from './tableHandler';
import { type Filter } from '../pages/StartPage/StartPageTypes';
import {
  Table,
  TablesResponse,
  TimeUnit,
  TableCategory,
  TablesService,
} from '@pxweb2/pxweb2-api-client';

// Test getFullTable
describe('getAllTables', () => {
  const mockSuccessResponse: TablesResponse = {
    language: 'en',
    tables: [
      {
        id: 'TAB4707',
        label: 'Test table',
        description: '',
        updated: '2025-03-31T06:00:00Z',
        firstPeriod: '2020M01',
        lastPeriod: '2025M01',
        variableNames: ['var1', 'var2'],
        source: 'Test',
        paths: [[{ id: 'TEST', label: 'Test' }]],
        links: [],
        category: TableCategory.PUBLIC,
        timeUnit: TimeUnit.ANNUAL,
      } as Table,
    ],
    page: {
      pageNumber: 1,
      pageSize: 1,
      totalElements: 1,
      totalPages: 1,
      links: [],
    },
    links: [],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and return tables from TableService', async () => {
    const listAllTablesSpy = vi
      .spyOn(TablesService, 'listAllTables')
      .mockResolvedValueOnce(mockSuccessResponse);

    const tables = await getAllTables('en');
    expect(listAllTablesSpy).toHaveBeenCalledTimes(1);
    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBe(1);
    expect(tables[0].id).toBe('TAB4707');
  });

  it('should retry with fallback language when receiving unsupported language error', async () => {
    const listAllTablesSpy = vi.spyOn(TablesService, 'listAllTables');

    // First call throws unsupported language error
    listAllTablesSpy.mockRejectedValueOnce({
      body: { title: 'Unsupported language' },
    });

    // Second call with fallback language succeeds
    listAllTablesSpy.mockResolvedValueOnce(mockSuccessResponse);

    const tables = await getAllTables('unsupported-lang');

    // Verify both calls were made
    expect(listAllTablesSpy).toHaveBeenCalledTimes(2);

    // Verify first call was with the original language
    expect(listAllTablesSpy).toHaveBeenNthCalledWith(
      1,
      'unsupported-lang',
      undefined,
      undefined,
      true,
      1,
      10000,
    );

    // Verify second call was with the fallback language
    expect(listAllTablesSpy).toHaveBeenNthCalledWith(
      2,
      'en',
      undefined,
      undefined,
      true,
      1,
      10000,
    );

    // Verify we got the tables from the fallback call
    expect(tables).toEqual(mockSuccessResponse.tables);
  });

  it('should throw error when both original and fallback language calls fail', async () => {
    const listAllTablesSpy = vi.spyOn(TablesService, 'listAllTables');
    listAllTablesSpy.mockRejectedValueOnce({
      body: { title: 'Unsupported language' },
    });

    // Second call also fails
    const fallbackError = new Error('Fallback language failed');
    listAllTablesSpy.mockRejectedValueOnce(fallbackError);

    // Verify the error is thrown
    await expect(getAllTables('unsupported-lang')).rejects.toThrow();

    // Verify both calls were made
    expect(listAllTablesSpy).toHaveBeenCalledTimes(2);
  });

  it('should throw a friendly error when API returns 404', async () => {
    vi.spyOn(TablesService, 'listAllTables').mockRejectedValueOnce({
      status: 404,
    });

    await expect(getAllTables('en')).rejects.toThrow('No tables found (404)');
  });

  it('should rethrow non-404 errors', async () => {
    const error = new Error('Network down');
    vi.spyOn(TablesService, 'listAllTables').mockRejectedValueOnce(error);

    await expect(getAllTables('en')).rejects.toThrow('Network down');
  });

  it('should use default language when language is not provided', async () => {
    const listAllTablesSpy = vi
      .spyOn(TablesService, 'listAllTables')
      .mockResolvedValueOnce(mockSuccessResponse);

    await getAllTables();

    expect(listAllTablesSpy).toHaveBeenCalledWith(
      'en',
      undefined,
      undefined,
      true,
      1,
      10000,
    );
  });
});

describe('queryTablesByKeyword', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return tables for keyword query', async () => {
    const listAllTablesSpy = vi
      .spyOn(TablesService, 'listAllTables')
      .mockResolvedValueOnce({
        language: 'en',
        tables: [tableYear],
        page: {
          pageNumber: 1,
          pageSize: 1,
          totalElements: 1,
          totalPages: 1,
          links: [],
        },
        links: [],
      });

    const tables = await queryTablesByKeyword('personer', 'en');

    expect(listAllTablesSpy).toHaveBeenCalledWith(
      'en',
      'personer',
      undefined,
      true,
      1,
      10000,
    );
    expect(tables).toHaveLength(1);
    expect(tables[0].id).toBe(tableYear.id);
  });

  it('should throw when keyword query fails', async () => {
    vi.spyOn(TablesService, 'listAllTables').mockRejectedValueOnce(
      new Error('query failed'),
    );

    await expect(queryTablesByKeyword('personer', 'en')).rejects.toThrow(
      'query failed',
    );
  });

  it('should use default language for keyword query when language is omitted', async () => {
    const listAllTablesSpy = vi
      .spyOn(TablesService, 'listAllTables')
      .mockResolvedValueOnce({
        language: 'en',
        tables: [tableYear],
        page: {
          pageNumber: 1,
          pageSize: 1,
          totalElements: 1,
          totalPages: 1,
          links: [],
        },
        links: [],
      });

    await queryTablesByKeyword('personer');

    expect(listAllTablesSpy).toHaveBeenCalledWith(
      'en',
      'personer',
      undefined,
      true,
      1,
      10000,
    );
  });
});

const testFilterMonthYear: Filter[] = [
  { type: 'timeUnit', value: 'Monthly', index: 1, label: 'Monthly' },
  { type: 'timeUnit', value: 'Annual', index: 2, label: 'Annual' },
];

const testFilterQuarter: Filter[] = [
  { type: 'timeUnit', value: 'Quarterly', index: 0, label: 'Quarterly' },
];

const testFilterSubjectTimeAllow: Filter[] = [
  { type: 'timeUnit', value: 'Annual', index: 0, label: 'Monthly' },
  { type: 'subject', value: 'al', index: 1, label: 'Arbeid og lønn' },
];

const testFilterSubjectTimeDisallow: Filter[] = [
  { type: 'timeUnit', value: 'Annual', index: 0, label: 'Monthly' },
  {
    type: 'subject',
    value: 'brrftt',
    index: 1,
    label: 'Testfilter Som Ikke Skal Være Gyldig',
  },
];

const tableYear: Table = {
  id: '13618',
  label:
    '13618: Personer, etter arbeidsstyrkestatus, kjønn og alder. Bruddjusterte tall 2009-2022',
  description: '',
  updated: '2023-04-11T06:00:00Z',
  firstPeriod: '2009',
  lastPeriod: '2022',
  category: TableCategory.PUBLIC,
  variableNames: [
    'arbeidsstyrkestatus',
    'kjønn',
    'alder',
    'statistikkvariabel',
    'år',
  ],
  source: 'Statistisk sentralbyrå',
  timeUnit: TimeUnit.ANNUAL,
  paths: [
    [
      {
        id: 'al',
        label: 'Arbeid og lønn',
      },
    ],
  ],
  links: [
    {
      rel: 'self',
      hreflang: 'no',
      href: 'https://data.qa.ssb.no/api/pxwebapi/v2-beta/tables/13618?lang=no',
    },
    {
      rel: 'metadata',
      hreflang: 'no',
      href: 'https://data.qa.ssb.no/api/pxwebapi/v2-beta/tables/13618/metadata?lang=no',
    },
    {
      rel: 'data',
      hreflang: 'no',
      href: 'https://data.qa.ssb.no/api/pxwebapi/v2-beta/tables/13618/data?lang=no&outputFormat=json-stat2',
    },
  ],
};

test('Yearly filter should accept Yearly data', () => {
  expect(shouldTableBeIncluded(tableYear, testFilterMonthYear)).toBe(true);
});

test('Quarterly filter should reject Yearly data', () => {
  expect(shouldTableBeIncluded(tableYear, testFilterQuarter)).toBe(false);
});

test('Time and subject filter 1 should allow test data', () => {
  expect(shouldTableBeIncluded(tableYear, testFilterSubjectTimeAllow)).toBe(
    true,
  );
});

test('Time and subject filter 2 should disallow test data', () => {
  expect(shouldTableBeIncluded(tableYear, testFilterSubjectTimeDisallow)).toBe(
    false,
  );
});

test('Search for a single existing word should include table', () => {
  expect(
    shouldTableBeIncluded(tableYear, [
      {
        index: 1,
        type: 'search',
        label: '"bruddjusterte"',
        value: 'bruddjusterte',
      },
    ]),
  ).toBe(true);
});

test('Search for multiple existing words should include table', () => {
  expect(
    shouldTableBeIncluded(tableYear, [
      {
        index: 1,
        type: 'search',
        label: '"bruddjusterte alder"',
        value: 'bruddjusterte alder',
      },
    ]),
  ).toBe(true);
});

test('Search for one word which exists and one which doesnt should NOT include table', () => {
  expect(
    shouldTableBeIncluded(tableYear, [
      {
        index: 1,
        type: 'search',
        label: '"bruddjusterte testord"',
        value: 'bruddjusterte testord',
      },
    ]),
  ).toBe(false);
});

test('Year range within table span should include table', () => {
  expect(
    shouldTableBeIncluded(tableYear, [
      {
        index: 1,
        type: 'yearRange',
        label: '2010-2015',
        value: '2010-2015',
      },
    ]),
  ).toBe(true);
});

test('Year range outside table span should not include table', () => {
  expect(
    shouldTableBeIncluded(tableYear, [
      {
        index: 1,
        type: 'yearRange',
        label: '2030-2031',
        value: '2030-2031',
      },
    ]),
  ).toBe(false);
});

test('Single year in range filter should include table if year is present', () => {
  expect(
    shouldTableBeIncluded(tableYear, [
      {
        index: 1,
        type: 'yearRange',
        label: '2011',
        value: '2011',
      },
    ]),
  ).toBe(true);
});

test('Variable filter should include when all variables exist', () => {
  expect(
    shouldTableBeIncluded(tableYear, [
      {
        index: 1,
        type: 'variable',
        label: 'alder',
        value: 'alder',
      },
      {
        index: 2,
        type: 'variable',
        label: 'kjønn',
        value: 'kjønn',
      },
    ]),
  ).toBe(true);
});

test('Variable filter should exclude when one variable is missing', () => {
  expect(
    shouldTableBeIncluded(tableYear, [
      {
        index: 1,
        type: 'variable',
        label: 'finnes-ikke',
        value: 'finnes-ikke',
      },
    ]),
  ).toBe(false);
});

test('Status filter active should include non-discontinued table', () => {
  expect(
    shouldTableBeIncluded(tableYear, [
      {
        index: 1,
        type: 'status',
        label: 'active',
        value: 'active',
      },
    ]),
  ).toBe(true);
});

test('Status filter discontinued should include discontinued table', () => {
  const discontinuedTable: Table = {
    ...tableYear,
    id: '13618-discontinued',
    discontinued: true,
  };

  expect(
    shouldTableBeIncluded(discontinuedTable, [
      {
        index: 1,
        type: 'status',
        label: 'discontinued',
        value: 'discontinued',
      },
    ]),
  ).toBe(true);
});

test('Status filter with both active and discontinued should include any table', () => {
  const discontinuedTable: Table = {
    ...tableYear,
    id: '13618-discontinued-2',
    discontinued: true,
  };

  expect(
    shouldTableBeIncluded(discontinuedTable, [
      {
        index: 1,
        type: 'status',
        label: 'active',
        value: 'active',
      },
      {
        index: 2,
        type: 'status',
        label: 'discontinued',
        value: 'discontinued',
      },
    ]),
  ).toBe(true);
});

test('Invalid year period data should fail year range matching', () => {
  const invalidPeriodTable: Table = {
    ...tableYear,
    id: 'invalid-periods',
    firstPeriod: '',
    lastPeriod: '',
  };

  expect(
    shouldTableBeIncluded(invalidPeriodTable, [
      {
        index: 1,
        type: 'yearRange',
        label: '2020-2021',
        value: '2020-2021',
      },
    ]),
  ).toBe(false);
});

test('Matcher with only yearFrom should include when from year is inside span', () => {
  const matcher = buildCompiledMatcher([]);
  matcher.yearFrom = 2010;
  matcher.yearTo = undefined;

  expect(shouldTableBeIncludedWithMatcher(tableYear, matcher)).toBe(true);
});

test('Matcher with only yearTo should include when to year is inside span', () => {
  const matcher = buildCompiledMatcher([]);
  matcher.yearFrom = undefined;
  matcher.yearTo = 2020;

  expect(shouldTableBeIncludedWithMatcher(tableYear, matcher)).toBe(true);
});

test('Year range parser should ignore invalid range and include table', () => {
  expect(
    shouldTableBeIncluded(tableYear, [
      {
        index: 1,
        type: 'yearRange',
        label: 'invalid',
        value: 'abc-def',
      },
    ]),
  ).toBe(true);
});

test('Year range parser should support partially invalid upper bound', () => {
  expect(
    shouldTableBeIncluded(tableYear, [
      {
        index: 1,
        type: 'yearRange',
        label: '2010-def',
        value: '2010-def',
      },
    ]),
  ).toBe(true);
});

test('Search parser should ignore extra spaces in query words', () => {
  expect(
    shouldTableBeIncluded(tableYear, [
      {
        index: 1,
        type: 'search',
        label: '"  bruddjusterte   alder  "',
        value: '  bruddjusterte   alder  ',
      },
    ]),
  ).toBe(true);
});

test('Subject matcher should reject tables with missing subject ids', () => {
  const tableWithoutSubjectIds: Table = {
    ...tableYear,
    id: 'no-subject-ids',
    paths: [[{ label: 'Subject without id' } as never]],
  };

  expect(
    shouldTableBeIncluded(tableWithoutSubjectIds, [
      {
        index: 1,
        type: 'subject',
        label: 'Arbeid og lønn',
        value: 'al',
      },
    ]),
  ).toBe(false);
});

test('Time unit matcher should reject when table has no time unit', () => {
  const noTimeUnitTable: Table = {
    ...tableYear,
    id: 'no-timeunit',
    timeUnit: undefined,
  };

  expect(
    shouldTableBeIncluded(noTimeUnitTable, [
      {
        index: 1,
        type: 'timeUnit',
        label: 'Annual',
        value: 'Annual',
      },
    ]),
  ).toBe(false);
});

test('Year span cache should handle cached null result consistently', () => {
  const invalidPeriodTable: Table = {
    ...tableYear,
    id: 'invalid-periods-cache',
    firstPeriod: '',
    lastPeriod: '',
  };
  const yearFilter: Filter[] = [
    {
      index: 1,
      type: 'yearRange',
      label: '2020-2021',
      value: '2020-2021',
    },
  ];

  expect(shouldTableBeIncluded(invalidPeriodTable, yearFilter)).toBe(false);
  expect(shouldTableBeIncluded(invalidPeriodTable, yearFilter)).toBe(false);
});
