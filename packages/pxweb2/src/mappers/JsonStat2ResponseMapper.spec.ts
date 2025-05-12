import { ClassType, CodeListType, Dataset } from '@pxweb2/pxweb2-api-client';
import {
  mapJsonStat2Response,
  createDataAndStatus,
  createCube,
} from '../mappers/JsonStat2ResponseMapper';

import {
  Dimensions,
  PxTableData,
  PxTableMetadata,
  VartypeEnum,
  DataCell,
} from '@pxweb2/pxweb2-ui';

describe('JsonStat2ResponseMapper', () => {
  describe('mapJsonStat2Response', () => {
    it('should map a Dataset with dummy data to a PxTable', () => {
      // Arrange
      const dataset: Dataset = {
        // Dummy data
        label: 'Table label',
        source: 'Statistics Sweden',
        updated: '2025-02-21T07:00:00Z',
        dimension: {
          time: {
            label: 'Time',
            category: {
              index: {
                '2021': 0,
                '2022': 1,
              },
              label: {
                '2021': '2021',
                '2022': '2022',
              },
            },
            extension: { elimination: false },
          },
          country: {
            label: 'Country',
            note: ['Variable note 1', 'Variable note 2'],
            category: {
              index: {
                US: 0,
                UK: 1,
              },
              label: {
                US: 'United States',
                UK: 'United Kingdom',
              },
              note: {
                US: [
                  'This note is NOT mandatory. Value note for US',
                  'This note is mandatory! Value note for US',
                ],
                UK: ['This note is mandatory! Value note for UK'],
              },
            },
            extension: {
              elimination: true,
              noteMandatory: {
                '0': true,
              },
              categoryNoteMandatory: {
                US: {
                  '1': true,
                },
                UK: {
                  '0': true,
                },
              },

              codeLists: [
                {
                  id: 'cd1',
                  label: 'Codelist 1',
                  type: CodeListType.AGGREGATION,
                  links: [],
                },
                {
                  id: 'cd2',
                  label: 'Codelist 2',
                  type: CodeListType.VALUESET,
                  links: [],
                },
              ],
            },
          },
          ContentsCode: {
            label: 'observations',
            category: {
              index: {
                CONTENT1: 0,
                CONTENT2: 1,
              },
              label: {
                CONTENT1: 'Population',
                CONTENT2: 'Population growth',
              },
              unit: {
                CONTENT1: {
                  base: 'number of persons',
                  decimals: 0,
                },
                CONTENT2: {
                  base: 'number of persons',
                  decimals: 1,
                },
              },
            },
            extension: {
              elimination: false,
              refperiod: {
                CONTENT1: '31 December each year',
                CONTENT2: '1 January each year',
              },
              show: 'value',
              codeLists: [],
            },
          },
        },
        value: [100, 200, 300, 400, 500, 600, 700, 800],
        version: Dataset.version._2_0,
        class: ClassType.DATASET,
        role: {
          time: ['Time'],
          metric: ['ContentsCode'],
        },
        id: ['Time', 'Country', 'ContentsCode'],
        size: [2, 2, 2],
        note: ['Note 1', 'Note 2', 'Note 3'],
        extension: {
          noteMandatory: {
            '0': true,
            '1': true,
          },
          px: {
            infofile: 'TEST01',
            tableid: 'TAB001',
            decimals: 0,
            'official-statistics': true,
            aggregallowed: true,
            language: 'en',
            contents: 'Population',
            descriptiondefault: false,
            matrix: 'TEST001',
            'subject-code': 'POP',
            'subject-area': 'Population',
          },
          contact: [
            {
              name: ' Contact 1',
              phone: '111-1111 11 11',
              mail: 'information@company.com',
              raw: ' Contact 1, Company# 111-1111 11 11#information@company.com',
            },
            {
              name: ' Contact 2',
              phone: '222-2222 22 22',
              mail: 'information2@company.com',
              raw: ' Contact 2, Company# 222-2222 22 22#information2@company.com',
            },
          ],
        },
      };

      // Act
      const pxTable = mapJsonStat2Response(dataset);

      // Assert
      expect(pxTable).toBeDefined();
      // Add more assertions here to validate the mapping
      expect(pxTable.metadata.label).equals('Table label');
      expect(pxTable.metadata.source).equals('Statistics Sweden');
      expect(pxTable.metadata.updated).toEqual(
        new Date('2025-02-21T07:00:00Z'),
      );
      expect(pxTable.metadata.decimals).equals(0);
      expect(pxTable.metadata.officialStatistics).equals(true);
      expect(pxTable.metadata.aggregationAllowed).equals(true);
      expect(pxTable.metadata.contents).equals('Population');
      expect(pxTable.metadata.descriptionDefault).equals(false);
      expect(pxTable.metadata.matrix).equals('TEST001');
      expect(pxTable.metadata.id).equals('TAB001');
      expect(pxTable.metadata.language).equals('en');
      expect(pxTable.metadata.infofile).equals('TEST01');
      expect(pxTable.metadata.subjectCode).equals('POP');
      expect(pxTable.metadata.subjectArea).equals('Population');
      expect(pxTable.metadata.variables.length).equals(3);
      expect(pxTable.metadata.variables[0].values.length).equals(2);
      expect(pxTable.metadata.variables[0].mandatory).equals(true);
      expect(pxTable.metadata.variables[0].codeLists?.length).equals(0);
      expect(pxTable.metadata.variables[1].mandatory).equals(false);
      expect(pxTable.metadata.variables[1].codeLists?.length).equals(2);
      expect(pxTable.metadata.contacts?.length).equals(2);
      expect(pxTable.metadata.notes?.length).equals(3);
      expect(pxTable.metadata.notes[0].mandatory).equals(true);
      expect(pxTable.metadata.notes[2].mandatory).equals(false);
      expect(pxTable.metadata.variables[1].notes?.length).equals(2);
      expect(pxTable.metadata.variables[1].notes?.[0].mandatory).equals(true);
      expect(pxTable.metadata.variables[1].notes?.[1].mandatory).equals(false);
      expect(pxTable.metadata.variables[1].values[0].notes?.length).equals(2);
      expect(pxTable.metadata.variables[1].values[1].notes?.length).equals(1);
      expect(
        pxTable.metadata.variables[1].values[0].notes?.[0].mandatory,
      ).equals(false);
      expect(
        pxTable.metadata.variables[1].values[0].notes?.[1].mandatory,
      ).equals(true);
      expect(pxTable.metadata.variables[2].values[0].contentInfo?.unit).equals(
        'number of persons',
      );
      expect(
        pxTable.metadata.variables[2].values[0].contentInfo?.referencePeriod,
      ).equals('31 December each year');
      expect(
        pxTable.metadata.variables[2].values[1].contentInfo?.decimals,
      ).equals(1);
    });
  });
  describe('createDataAndStatus', () => {
    it('should map values and statuses correctly when both are provided', () => {
      // Arrange
      const dataset: Dataset = {
        value: [100, 200, 300],
        status: { '0': 'A', '1': 'B', '2': 'C' },
        dimension: {},
        id: [],
        size: [],
        class: ClassType.DATASET,
        version: Dataset.version._2_0,
      };

      // Act
      const result = createDataAndStatus(dataset);

      // Assert
      expect(result).toEqual({
        0: { value: 100, status: 'A', presentation: undefined },
        1: { value: 200, status: 'B', presentation: undefined },
        2: { value: 300, status: 'C', presentation: undefined },
      });
    });

    it('should map values correctly and set status as undefined when status is not provided', () => {
      // Arrange
      const dataset: Dataset = {
        value: [100, 200, 300],
        dimension: {},
        id: [],
        size: [],
        class: ClassType.DATASET,
        version: Dataset.version._2_0,
      };

      // Act
      const result = createDataAndStatus(dataset);

      // Assert
      expect(result).toEqual({
        0: { value: 100, status: undefined, presentation: undefined },
        1: { value: 200, status: undefined, presentation: undefined },
        2: { value: 300, status: undefined, presentation: undefined },
      });
    });

    it('should return an empty object when no values are provided', () => {
      // Arrange
      const dataset: Dataset = {
        value: [],
        dimension: {},
        id: [],
        size: [],
        class: ClassType.DATASET,
        version: Dataset.version._2_0,
      };

      // Act
      const result = createDataAndStatus(dataset);

      // Assert
      expect(result).toEqual({});
    });

    it('should handle cases where status array is shorter than value array', () => {
      // Arrange
      const dataset: Dataset = {
        value: [100, 200, 300],
        status: { '0': 'A' },
        dimension: {},
        id: [],
        size: [],
        class: ClassType.DATASET,
        version: Dataset.version._2_0,
      };

      // Act
      const result = createDataAndStatus(dataset);

      // Assert
      expect(result).toEqual({
        0: { value: 100, status: 'A', presentation: undefined },
        1: { value: 200, status: undefined, presentation: undefined },
        2: { value: 300, status: undefined, presentation: undefined },
      });
    });

    it('should populate the data cube correctly for a simple dataset', () => {
      // Arrange
      const valueAndStatus: Record<string, DataCell> = {
        0: { value: 100, status: 'A', presentation: undefined },
        1: { value: 200, status: 'B', presentation: undefined },
        2: { value: 300, status: 'C', presentation: undefined },
        3: { value: 400, status: 'D', presentation: undefined },
      };

      const metadata: PxTableMetadata = {
        id: 'TAB001',
        language: 'en',
        label: 'Test Table',
        description: '',
        updated: new Date(),
        source: 'Test Source',
        infofile: '',
        decimals: 0,
        officialStatistics: true,
        aggregationAllowed: true,
        contents: '',
        descriptionDefault: false,
        matrix: '',
        survey: '',
        updateFrequency: '',
        link: '',
        nextUpdate: undefined,
        subjectCode: '',
        subjectArea: '',
        variables: [
          {
            id: 'Time',
            label: 'Time',
            type: VartypeEnum.REGULAR_VARIABLE,
            mandatory: true,
            values: [
              { code: '2021', label: '2021' },
              { code: '2022', label: '2022' },
            ],
            codeLists: [],
            notes: [],
          },
          {
            id: 'Country',
            label: 'Country',
            type: VartypeEnum.REGULAR_VARIABLE,
            mandatory: true,
            values: [
              { code: 'US', label: 'United States' },
              { code: 'UK', label: 'United Kingdom' },
            ],
            codeLists: [],
            notes: [],
          },
        ],
        contacts: [],
        notes: [],
      };

      const data: PxTableData = {
        cube: {},
        variableOrder: [],
        isLoaded: false,
      };

      const dimensions: Dimensions = [];
      const counter = { number: 0 };

      // Act
      createCube(valueAndStatus, metadata, data, dimensions, 0, counter);

      // Assert
      expect(data.cube).toEqual({
        '2021': {
          US: { value: 100, status: 'A', presentation: undefined },
          UK: { value: 200, status: 'B', presentation: undefined },
        },
        '2022': {
          US: { value: 300, status: 'C', presentation: undefined },
          UK: { value: 400, status: 'D', presentation: undefined },
        },
      });
    });

    it('should handle an empty valueAndStatus object gracefully', () => {
      // Arrange
      const valueAndStatus: Record<string, DataCell> = {};

      const metadata: PxTableMetadata = {
        id: 'TAB001',
        language: 'en',
        label: 'Test Table',
        description: '',
        updated: new Date(),
        source: 'Test Source',
        infofile: '',
        decimals: 0,
        officialStatistics: true,
        aggregationAllowed: true,
        contents: '',
        descriptionDefault: false,
        matrix: '',
        survey: '',
        updateFrequency: '',
        link: '',
        nextUpdate: undefined,
        subjectCode: '',
        subjectArea: '',
        variables: [
          {
            id: 'Time',
            label: 'Time',
            type: VartypeEnum.REGULAR_VARIABLE,
            mandatory: true,
            values: [
              { code: '2021', label: '2021' },
              { code: '2022', label: '2022' },
            ],
            codeLists: [],
            notes: [],
          },
          {
            id: 'Country',
            label: 'Country',
            type: VartypeEnum.REGULAR_VARIABLE,
            mandatory: true,
            values: [
              { code: 'US', label: 'United States' },
              { code: 'UK', label: 'United Kingdom' },
            ],
            codeLists: [],
            notes: [],
          },
        ],
        contacts: [],
        notes: [],
      };

      const data: PxTableData = {
        cube: {},
        variableOrder: [],
        isLoaded: false,
      };

      const dimensions: Dimensions = [];
      const counter = { number: 0 };

      // Act
      createCube(valueAndStatus, metadata, data, dimensions, 0, counter);

      // Assert
      expect(data.cube).toEqual({
        '2021': {
          UK: undefined,
          US: undefined,
        },
        '2022': {
          UK: undefined,
          US: undefined,
        },
      });
    });

    it('should handle a single variable with one value correctly', () => {
      // Arrange
      const valueAndStatus: Record<string, DataCell> = {
        0: { value: 100, status: 'A', presentation: undefined },
      };

      const metadata: PxTableMetadata = {
        id: 'TAB001',
        language: 'en',
        label: 'Test Table',
        description: '',
        updated: new Date(),
        source: 'Test Source',
        infofile: '',
        decimals: 0,
        officialStatistics: true,
        aggregationAllowed: true,
        contents: '',
        descriptionDefault: false,
        matrix: '',
        survey: '',
        updateFrequency: '',
        link: '',
        nextUpdate: undefined,
        subjectCode: '',
        subjectArea: '',
        variables: [
          {
            id: 'Time',
            label: 'Time',
            type: VartypeEnum.REGULAR_VARIABLE,
            mandatory: true,
            values: [{ code: '2021', label: '2021' }],
            codeLists: [],
            notes: [],
          },
        ],
        contacts: [],
        notes: [],
      };

      const data: PxTableData = {
        cube: {},
        variableOrder: [],
        isLoaded: false,
      };

      const dimensions: Dimensions = [];
      const counter = { number: 0 };

      // Act
      createCube(valueAndStatus, metadata, data, dimensions, 0, counter);

      // Assert
      expect(data.cube).toEqual({
        '2021': { value: 100, status: 'A', presentation: undefined },
      });
    });
  });
});
