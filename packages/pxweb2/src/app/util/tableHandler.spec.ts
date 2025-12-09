import { vi } from 'vitest';
import { getAllTables, shouldTableBeIncluded } from './tableHandler';
import { type Filter } from '../pages/StartPage/StartPageTypes';
import { Table, TablesResponse, TimeUnit } from '@pxweb2/pxweb2-api-client';

// Mock TablesService.listAllTables
vi.mock(import('@pxweb2/pxweb2-api-client'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    TablesService: {
      listAllTables: vi.fn(),
    },
    OpenAPI: vi.fn(),
  };
});

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
        category: Table.category.PUBLIC,
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
    vi.resetAllMocks();
  });

  it('should fetch and return tables from TablesService', async () => {
    const { TablesService } = await import('@pxweb2/pxweb2-api-client');
    vi.mocked(TablesService.listAllTables).mockResolvedValueOnce(
      mockSuccessResponse,
    );

    const tables = await getAllTables('en');
    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBe(1);
    expect(tables[0].id).toBe('TAB4707');
  });

  it('should retry with fallback language when receiving unsupported language error', async () => {
    const { TablesService } = await import('@pxweb2/pxweb2-api-client');
    const listAllTablesSpy = vi.mocked(TablesService.listAllTables);

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
    const { TablesService } = await import('@pxweb2/pxweb2-api-client');
    const listAllTablesSpy = vi.mocked(TablesService.listAllTables);

    // First call throws unsupported language error
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
  category: Table.category.PUBLIC,
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
