import { vi } from 'vitest';
import { getAllTables, shouldTableBeIncluded } from './tableHandler';
import { Config } from './config/configType';
import { type Filter } from '../pages/StartPage/StartPageTypes';
import { Table } from 'packages/pxweb2-api-client/src';

vi.mock('./config/getConfig', () => {
  return {
    getConfig: vi.fn().mockReturnValue({
      language: {
        supportedLanguages: [
          { shorthand: 'en', languageName: 'English' },
          { shorthand: 'no', languageName: 'Norsk' },
          { shorthand: 'sv', languageName: 'Svenska' },
          { shorthand: 'ar', languageName: 'العربية' },
        ],
        defaultLanguage: 'en',
        fallbackLanguage: 'en',
      },
      apiUrl: 'https://api.scb.se/OV0104/v2beta/api/v2',
      maxDataCells: 100000,
      specialCharacters: ['.', '..', ':', '-', '...', '*'],
    } as Config),
  };
});

// Mock TableService.listAllTables
vi.mock('@pxweb2/pxweb2-api-client', () => {
  return {
    TableService: {
      listAllTables: vi.fn().mockResolvedValue({
        language: 'sv',
        tables: [
          {
            type: 'Table',
            id: 'TAB4707',
            label:
              'Antal pågående anställningar efter anställningstid, kön och sektor. Månad 2020M01-2025M01',
            description: '',
            updated: '2025-03-31T06:00:00Z',
            firstPeriod: '2020M01',
            lastPeriod: '2025M01',
            category: 'public',
            variableNames: ['sektor', 'kön', 'tabellinnehåll', 'månad'],
            source: 'SCB',
            timeUnit: 'Monthly',
            paths: [
              [
                { id: 'AM', label: 'Arbetsmarknad' },
                { id: 'AM0211', label: 'Anställningar' },
                { id: 'AM0211A', label: 'Anställningar' },
              ],
            ],
            links: [
              {
                rel: 'self',
                hreflang: 'sv',
                href: 'https://api.scb.se/OV0104/v2beta/api/v2/tables/TAB4707?lang=sv',
              },
              {
                rel: 'metadata',
                hreflang: 'sv',
                href: 'https://api.scb.se/OV0104/v2beta/api/v2/tables/TAB4707/metadata?lang=sv',
              },
              {
                rel: 'data',
                hreflang: 'sv',
                href: 'https://api.scb.se/OV0104/v2beta/api/v2/tables/TAB4707/data?lang=sv&outputFormat=px',
              },
            ],
          },
        ],
        page: {
          pageNumber: 1,
          pageSize: 1,
          totalElements: 5114,
          totalPages: 5114,
          links: [
            {
              rel: 'next',
              hreflang: 'sv',
              href: 'https://api.scb.se/OV0104/v2beta/api/v2/tables/?lang=sv&pagesize=1&pageNumber=2',
            },
            {
              rel: 'last',
              hreflang: 'sv',
              href: 'https://api.scb.se/OV0104/v2beta/api/v2/tables/?lang=sv&pagesize=1&pageNumber=5114',
            },
          ],
        },
        links: [
          {
            rel: 'self',
            hreflang: 'sv',
            href: 'https://api.scb.se/OV0104/v2beta/api/v2/tables/?lang=sv&pagesize=1&pageNumber=1',
          },
        ],
      }),
    },
    OpenAPI: vi.fn(),
  };
});

// Test getFullTable

describe('getFullTable', () => {
  it('should fetch and return tables from TableService', async () => {
    const tables = await getAllTables();
    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBeGreaterThan(0);
    expect(tables[0].id).toBe('TAB4707');
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
  category: 'public',
  variableNames: [
    'arbeidsstyrkestatus',
    'kjønn',
    'alder',
    'statistikkvariabel',
    'år',
  ],
  source: 'Statistisk sentralbyrå',
  timeUnit: 'Annual',
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
