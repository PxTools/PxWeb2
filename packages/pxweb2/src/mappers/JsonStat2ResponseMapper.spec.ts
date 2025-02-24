import { ClassType, Dataset } from '@pxweb2/pxweb2-api-client';
import { mapJsonStat2Response } from '../mappers/JsonStat2ResponseMapper';

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
                // {
                //   id: 'cd1',
                //   label: 'Codelist 1',
                //   type: 'Aggregation',
                //   links: [],
                // },
                //   {
                //     id: 'cd2',
                //     label: 'Codelist 2',
                //     type: CodeListType.VALUESET,
                //     links: [],
                //   },
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
      expect(pxTable.metadata.variables[1].codeLists?.length).equals(0);
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
});
