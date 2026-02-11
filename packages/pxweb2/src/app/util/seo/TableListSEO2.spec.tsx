import { createTableListSEO } from './TableListSEO2';
import { Table } from 'packages/pxweb2-api-client/src';

describe('createTableListSEO', () => {
  it('should create correct JSON-LD script for given tables and language', () => {
    const tables: Table[] = [
      {
        id: 'table1',
        label: 'Table 1',
        updated: '',
        firstPeriod: '',
        lastPeriod: '',
        variableNames: [],
        links: [],
      },
      {
        id: 'table2',
        label: 'Table 2',
        updated: '',
        firstPeriod: '',
        lastPeriod: '',
        variableNames: [],
        links: [],
      },
    ];
    const language = 'en';

    const result = createTableListSEO(language, tables);

    // Extract the JSON-LD content from the script element
    const jsonLdContent = result.props.children;
    const jsonLd = JSON.parse(jsonLdContent);

    expect(jsonLd).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Table 1',
          url: expect.stringContaining('/en/table/table1'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Table 2',
          url: expect.stringContaining('/en/table/table2'),
        },
      ],
    });
  });
});
