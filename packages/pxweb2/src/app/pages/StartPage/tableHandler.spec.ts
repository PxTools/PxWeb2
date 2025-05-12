import { vi } from 'vitest';
import { getFullTable } from './tableHandler';

vi.mock('../../util/config/getConfig', () => {
  return {
    getConfig: vi.fn().mockResolvedValue({
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
    }),
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
    const tables = await getFullTable;
    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBeGreaterThan(0);
    expect(tables[0].id).toBe('TAB4707');
  });
});
