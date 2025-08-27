import React from 'react';
import { vi } from 'vitest';

import { render } from '@testing-library/react';
import { VariablesProvider } from '../context/VariablesProvider';
import { TableDataProvider } from '../context/TableDataProvider';
import { AppProvider } from '../context/AppProvider';

const renderWithProviders = (ui: React.ReactNode) => {
  return render(
    <AppProvider>
      <VariablesProvider>
        <TableDataProvider>{ui}</TableDataProvider>
      </VariablesProvider>
    </AppProvider>,
  );
};

function mockTableService() {
  vi.mock('@pxweb2/pxweb2-api-client', () => {
    return {
      // Provide enums/constants used at module-evaluation time by components like DrawerSave
      OutputFormatType: {
        XLSX: 'XLSX',
        CSV: 'CSV',
        PX: 'PX',
        JSON_STAT2: 'JSON_STAT2',
        HTML: 'HTML',
        PARQUET: 'PARQUET',
      },
      TableService: {
        getTableById: vi.fn().mockResolvedValue({
          id: 'TAB638',
          label:
            'Population by region, marital status, age, sex, observations and year',
          language: 'en',
          languages: ['sv', 'en'],
          elimination: false,
          type: 'Table',
          links: [
            {
              rel: 'self',
              hreflang: 'en',
              href: 'https://api.scb.se/OV0104/v2beta/api/v2/tables/TAB638?lang=en',
            },
            {
              rel: 'alternate',
              hreflang: 'sv',
              href: 'https://api.scb.se/OV0104/v2beta/api/v2/tables/TAB638?lang=sv',
            },
          ],
        }),
        getTableCodeListById: vi.fn().mockResolvedValue({
          id: 'vs_RegionLän07',
          label: 'County',
          language: 'en',
          languages: ['sv', 'en'],
          elimination: false,
          type: 'Valueset',
          values: [
            {
              code: '01',
              label: 'Stockholm county',
              valueMap: ['01'],
            },
            {
              code: '03',
              label: 'Uppsala county',
              valueMap: ['03'],
            },
            {
              code: '04',
              label: 'Södermanland county',
              valueMap: ['04'],
            },
            {
              code: '05',
              label: 'Östergötland county',
              valueMap: ['05'],
            },
            {
              code: '06',
              label: 'Jönköping county',
              valueMap: ['06'],
            },
            {
              code: '07',
              label: 'Kronoberg county',
              valueMap: ['07'],
            },
            {
              code: '08',
              label: 'Kalmar county',
              valueMap: ['08'],
            },
            {
              code: '09',
              label: 'Gotland county',
              valueMap: ['09'],
            },
            {
              code: '10',
              label: 'Blekinge county',
              valueMap: ['10'],
            },
            {
              code: '12',
              label: 'Skåne county',
              valueMap: ['12'],
            },
            {
              code: '13',
              label: 'Halland county',
              valueMap: ['13'],
            },
            {
              code: '14',
              label: 'Västra Götaland county',
              valueMap: ['14'],
            },
            {
              code: '17',
              label: 'Värmland county',
              valueMap: ['17'],
            },
            {
              code: '18',
              label: 'Örebro county',
              valueMap: ['18'],
            },
            {
              code: '19',
              label: 'Västmanland county',
              valueMap: ['19'],
            },
            {
              code: '20',
              label: 'Dalarna county',
              valueMap: ['20'],
            },
            {
              code: '21',
              label: 'Gävleborg county',
              valueMap: ['21'],
            },
            {
              code: '22',
              label: 'Västernorrland county',
              valueMap: ['22'],
            },
            {
              code: '23',
              label: 'Jämtland county',
              valueMap: ['23'],
            },
            {
              code: '24',
              label: 'Västerbotten county',
              valueMap: ['24'],
            },
            {
              code: '25',
              label: 'Norrbotten county',
              valueMap: ['25'],
            },
          ],
          links: [
            {
              rel: 'self',
              hreflang: 'en',
              href: 'https://api.scb.se/OV0104/v2beta/api/v2/codeLists/vs_RegionLän07?lang=en',
            },
            {
              rel: 'alternate',
              hreflang: 'sv',
              href: 'https://api.scb.se/OV0104/v2beta/api/v2/codeLists/vs_RegionLän07?lang=sv',
            },
          ],
        }),
        getMetadataById: vi.fn().mockResolvedValue({}),
        getDefaultSelection: vi.fn().mockResolvedValue({
          links: [
            {
              rel: 'self',
              hreflang: 'en',
              href: 'https://api.scb.se/OV0104/v2beta/api/v2/tables/tab638/defaultselection?lang=en',
            },
          ],
          selection: [
            {
              variableCode: 'ContentsCode',
              valueCodes: ['BE0101N1'],
            },
            {
              variableCode: 'Tid',
              valueCodes: ['2024'],
            },
            {
              variableCode: 'Region',
              codeList: 'vs_RegionKommun07',
              valueCodes: ['0114', '0115'],
            },
            {
              variableCode: 'Kon',
              valueCodes: ['1', '2'],
            },
            {
              variableCode: 'Civilstand',
              valueCodes: [],
            },
            {
              variableCode: 'Alder',
              codeList: 'vs_Ålder1årA',
              valueCodes: [],
            },
          ],
          placement: {
            heading: ['ContentsCode', 'Tid', 'Kon'],
            stub: ['Region'],
          },
        }),
      },
      OpenAPI: vi.fn(),
    };
  });
}

export { renderWithProviders, mockTableService };
